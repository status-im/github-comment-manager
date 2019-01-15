const log = require('loglevel')
const Handlebars = require('handlebars')
const template = require('./template')

/* in theory the jenkins build comment should be the first one */
const PER_PAGE = 100
const COMMENT_REGEX = /\#\#\# Jenkins Builds\n/

/* loop helper compares commits of build and previous build */
const commitHelper = (data, index, options) => {
  if (index == 0) { return options.inverse(this); }
  if (data[index].commit !== data[index-1].commit) { return options.fn(this); }
  return options.inverse(this);
}

/* turns epoch time to human readable format */
const dateHelper = (data) => {
  return new Handlebars.SafeString(
    (new Date(data))
      .toISOString('utc')
      .slice(0, 19)
      .replace('T', ' ')
  )
}

class Comments {
  constructor(client, owner, repo, builds) {
    this.gh = client
    this.db = builds
    this.repo = repo   /* name of repo to query */
    this.owner = owner /* name of user who makes the comments */
    /* add helper for formatting dates */
    Handlebars.registerHelper('date', dateHelper)
    /* add helper for checking change in commit */
    Handlebars.registerHelper('commitChanged', commitHelper)
    /* setup templating for comments */
    Handlebars.registerPartial('build', template.build)
    this.template = Handlebars.compile(template.main);
  }

  async renderComment (pr) {
    const builds = await this.db.getBuilds(pr)
    if (builds.length == 0) {
      throw Error('No builds exist for this PR')
    }
    return this.template({builds})
  }

  async postComment (pr) {
    log.info(`Creating comment in PR-${pr}`)
    const body = await this.renderComment(pr)
    const rval = await this.gh.issues.createComment({
      owner: this.owner,
      repo: this.repo,
      number: pr,
      body,
    })
    return rval.data.id
  }

  async updateComment (pr, comment_id) {
    log.info(`Updating comment in PR-${pr}`)
    const body = await this.renderComment(pr)
    const rval = await this.gh.issues.updateComment({
      owner: this.owner,
      repo: this.repo,
      comment_id,
      body,
    })
    return rval.data.id
  }

  async update (pr) {
    /* check if comment was already posted */
    let id = await this.db.getCommentID(pr)
    if (id) {
      await this.updateComment(pr, id)
    } else {
      id = await this.postComment(pr)
      await this.db.addComment(pr, id)
    }
  }
}

module.exports = Comments
