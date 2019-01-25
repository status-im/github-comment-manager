const log = require('loglevel')
const Handlebars = require('handlebars')
const template = require('./template')

/* how many builds to show without folding */
const VIS_BUILDS = 3
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

/* remove seconds from duration to make columns equal width */
const shortenDuration = (data) => {
  return data.replace(/ [0-9]+ sec$/, '')
}

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
  constructor(client, owner, repo, builds) {
    this.gh = client
    this.db = builds
    this.repo = repo   /* name of repo to query */
    this.owner = owner /* name of user who makes the comments */
    /* add helper for formatting dates */
    Handlebars.registerHelper('date', dateHelper)
    /* add helper for shortening duration field */
    Handlebars.registerHelper('shortenDuration', shortenDuration)
    /* add helper for checking change in commit */
    Handlebars.registerHelper('commitChanged', commitHelper)
    /* add partis */
    Object.keys(template.partials).forEach(k=>
      Handlebars.registerPartial(k, template.partials[k])
    )
    /* setup templating for comments */
    this.template = Handlebars.compile(template.main);
  }

  async renderComment (pr) {
    const builds = await this.db.getBuilds(pr)
    if (builds.length == 0) {
      throw Error('No builds exist for this PR')
    }
    /* split to be able to fold if there are too many builds */
    const {visible, archived} = extractArchiveBuilds(builds)
    return this.template({visible, archived})
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
