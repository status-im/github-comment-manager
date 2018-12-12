import nunjucks from 'nunjucks'
import template from './template'

/* in theory the jenkins build comment should be the first one */
const PER_PAGE = 100
const COMMENT_REGEX = /\#\#\# Jenkins Builds\n/

class Comments {
  constructor(client, owner, repo, builds) {
    this.gh = client
    this.db = builds
    this.nj = nunjucks.configure({autoescape: false})
    this.template = template
    this.repo = repo   /* name of repo to query */
    this.owner = owner /* name of user who makes the comments */
  }

  async listComments (pr, per_page = PER_PAGE, sort = 'updated', direction = 'desc') {
    /* TODO pagination? */
    const rval = await this.gh.issues.listComments({
      owner: this.owner,
      repo: this.repo,
      number: pr,
      sort, direction, per_page,
    })
    return rval.data
  }

  async firstComment (pr) {
    const rval = await this.listComments(pr, 1, 'created', 'desc')
    return rval[0]
  }

  async findComment (pr) {
    const comments = await this.listComments(pr)
    /* find comment matching the regex */
    return comments.find(c => c.body.match(COMMENT_REGEX))
  }

  async renderComment (pr) {
    const builds = await this.db.getBuilds(pr)
    return this.nj.renderString(this.template, {builds})
  }

  async postComment (pr) {
    console.log(`Creating comment in PR-${pr}`)
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
    console.log(`Updating comment in PR-${pr}`)
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
      this.updateComment(pr, id)
    } else {
      id = await this.postComment(pr)
      await this.db.addComment(pr, id)
    }
  }
}

module.exports = Comments
