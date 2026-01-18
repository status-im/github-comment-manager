import log from 'loglevel'
import AwaitLock from 'await-lock'
import Handlebars from 'handlebars'

import extractArchiveBuilds from './utils.js'
import helpers from './helpers.js'
import template from './template.js'

class Comments {
  constructor({client, db, whitelist}) {
    this.gh = client
    this.db = db
    this.whitelist = whitelist /* repos to which we post */
    this.locks = {}    /* locks per repo+pr avoid race cond.  */
    /* add template helpers */
    Object.entries(helpers).forEach(([name, helper]) => (
      Handlebars.registerHelper(name, helper)
    ))
    /* add template partis */
    Object.entries(template.partials).forEach(([name, partial]) => (
      Handlebars.registerPartial(name, partial)
    ))
    /* setup templating for comments */
    this.template = Handlebars.compile(template.main);
  }

  async _renderComment ({org, repo, pr}) {
    const builds = await this.db.getPRBuilds({org, repo, pr})
    if (builds.length == 0) {
      throw Error('No builds exist for this PR')
    }
    /* split to be able to fold if there are too many builds */
    const {visible, archived} = extractArchiveBuilds(builds)
    return this.template({visible, archived})
  }

  async _postComment ({org, repo, pr}) {
    log.info(`Creating comment ${org}/${repo}#${pr}`)
    const body = await this._renderComment({org, repo, pr})
    const rval = await this.gh.issues.createComment({
      owner: org, repo: repo, issue_number: pr, body,
    })
    return rval.data.id
  }

  async _updateComment ({org, repo, pr, id}) {
    log.info(`Updating comment #${id} in ${org}/${repo}#${pr}`)
    const body = await this._renderComment({org, repo, pr})
    const rval = await this.gh.issues.updateComment({
      owner: org, repo, comment_id: id, body,
    })
    return rval.data.id
  }

  async update ({org, repo, pr}) {
    /* check if repo is in a whitelist */
    if (!this.whitelist.includes(`${org}/${repo}`)) {
      throw Error(`Repo not whitelisted: ${org}/${repo}`)
    }
    /* check if comment was already posted */
    let id = await this.db.getCommentID({org, repo, pr})
    if (id) {
      await this._updateComment({org, repo, pr, id})
    } else {
      id = await this._postComment({org, repo, pr})
      await this.db.addComment({org, repo, pr, id})
    }
  }

  async safeUpdate ({org, repo, pr}) {
    /* we use a lock to avoid creating multiple comments */
    const key = org + repo + pr
    /* use existing lock for repo+pr or create a new one */
    this.locks[key] || ( this.locks[key] = new AwaitLock() )
    await this.locks[key].acquireAsync()
    try {
      await this.update({org, repo, pr})
    } finally {
      this.locks[key].release()
    }
  }
}

export default Comments
