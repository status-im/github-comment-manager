class Builds {
  constructor(db) {
    this.db = db
    this.builds = db.addCollection('builds', {unique:['id']})
    this.comments = db.addCollection('comments', {unique: ['pr']})
  }

  async getBuilds (pr) {
    const builds = this.builds.find({pr})
    /* strip the $loki attribute */
    return builds.map((b) => {
      const {$loki, ...build} = b
      return build
    })
  }

  async addBuild (pr, build) {
    return this.builds.insert({pr, ...build})
  }

  async addComment (pr, comment_id) {
    return await this.comments.insert({pr, comment_id})
  }

  async getCommentID (pr) {
    const rval = this.comments.findOne({pr: pr})
    return rval ? rval.comment_id : null
  }
}

module.exports = Builds
