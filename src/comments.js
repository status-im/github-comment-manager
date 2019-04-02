const log = require('loglevel')
const AwaitLock = require('await-lock')
const Handlebars = require('handlebars')

const utils = require('./utils')
const helpers = require('./helpers')
const template = require('./template')

class Comments {
  constructor({client, owner, repos, builds}) {
    this.gh = client
    this.db = builds
    this.repos = repos /* whitelist of repos to which we post */
    this.owner = owner /* name of user who makes the comments */
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

  async _renderComment ({repo, pr}) {
    const builds = await this.db.getBuilds({repo, pr})
    if (builds.length == 0) {
      throw Error('No builds exist for this PR')
    }
    /* split to be able to fold if there are too many builds */
    const {visible, archived} = utils.extractArchiveBuilds(builds)
    return this.template({visible, archived})
  }

  async _postComment ({repo, pr}) {
    log.info(`Creating comment in PR-${pr}`)
    const body = await this._renderComment({repo, pr})
    const rval = await this.gh.issues.createComment({
      owner: this.owner,
      repo: repo,
      number: pr,
      body,
    })
    return rval.data.id
  }

  async _updateComment ({repo, pr, comment_id}) {
    log.info(`Updating comment #${comment_id} in PR-${pr}`)
    const body = await this._renderComment({repo, pr})
    const rval = await this.gh.issues.updateComment({
      owner: this.owner,
      repo: repo,
      comment_id,
      body,
    })
    return rval.data.id
  }

  async _update ({repo, pr}) {
    /* check if repo is in a whitelist */
    if (!this.repos.includes(repo)) {
      throw Error(`Repo not whitelisted: ${repo}`)
    }
    /* check if comment was already posted */
    let comment_id = await this.db.getCommentID({repo, pr})
    if (comment_id) {
      await this._updateComment({repo, pr, comment_id})
    } else {
      comment_id = await this._postComment({repo, pr})
      await this.db.addComment({repo, pr, comment_id})
    }
  }

  async update ({repo, pr}) {
    /* we use a lock to avoid creating multiple comments */
    let key = repo + pr
    /* use existing lock for repo+pr or create a new one */
    this.locks[key] || ( this.locks[key] = new AwaitLock() )
    await this.locks[key].acquireAsync()
    try {
      this._update({repo, pr})
    } finally {
      this.locks[key].release()
    }
  }
}

module.exports = Comments
