const log = require('loglevel')
const Handlebars = require('handlebars')

const template = require('./template')
const helpers = require('./helpers')

/* how many builds to show without folding */
const VIS_BUILDS = 3
const COMMENT_REGEX = /\#\#\# Jenkins Builds\n/

/* adds archive attribute to builds to mark for folding in template */
const extractArchiveBuilds = (builds) => {
  /* get unique commits */
  const commits = [...new Set(builds.map(b=>b.commit))]
  /* if there's not too many don't archive any */
  if (commits.length < VIS_BUILDS) {
    return {visible: builds, archived: []}
  }
  /* split builds into visible and archived */
  const archivedCommits = commits.slice(0, -(VIS_BUILDS-1))
  const archived = builds.filter(b => archivedCommits.includes(b.commit))
  const visible  = builds.slice(archived.length)
  return {visible, archived}
}

class Comments {
  constructor({client, owner, repos, builds}) {
    this.gh = client
    this.db = builds
    this.repos = repos /* whitelist of repos to which we post */
    this.owner = owner /* name of user who makes the comments */
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

  async renderComment ({repo, pr}) {
    const builds = await this.db.getBuilds({repo, pr})
    if (builds.length == 0) {
      throw Error('No builds exist for this PR')
    }
    /* split to be able to fold if there are too many builds */
    const {visible, archived} = extractArchiveBuilds(builds)
    return this.template({visible, archived})
  }

  async postComment ({repo, pr}) {
    log.info(`Creating comment in PR-${pr}`)
    const body = await this.renderComment({repo, pr})
    const rval = await this.gh.issues.createComment({
      owner: this.owner,
      repo: repo,
      number: pr,
      body,
    })
    return rval.data.id
  }

  async updateComment ({repo, pr, comment_id}) {
    log.info(`Updating comment #${comment_id} in PR-${pr}`)
    const body = await this.renderComment({repo, pr})
    const rval = await this.gh.issues.updateComment({
      owner: this.owner,
      repo: repo,
      comment_id,
      body,
    })
    return rval.data.id
  }

  async update ({repo, pr}) {
    /* check if repo is in a whitelist */
    if (!this.repos.includes(repo)) {
      throw Error(`Repo not whitelisted: ${repo}`)
    }
    /* check if comment was already posted */
    let comment_id = await this.db.getCommentID({repo, pr})
    if (comment_id) {
      await this.updateComment({repo, pr, comment_id})
    } else {
      comment_id = await this.postComment({repo, pr})
      await this.db.addComment({repo, pr, comment_id})
    }
  }
}

module.exports = Comments
