import Joi from 'joi'
import Loki from 'lokijs'
import schema from './schema'

class Builds {
  constructor(path, interval) {
    this.schema = schema
    this.db = new Loki(path, {
      autoload: true,
      autosave: true,
      autosaveInterval: interval,
      autoloadCallback: this.initDB.bind(this),
    })
  }

  initDB() {
    this.builds = this.db.getCollection('builds')
    if (!this.builds) {
      this.builds = this.db.addCollection('builds')
    }
    this.comments = this.db.getCollection('comments')
    if (!this.comments) {
      this.comments = this.db.addCollection('comments')
    }
    /* just to make sure we save on close */
    this.db.on('close', () => this.save())
  }

  validate (build) {
    return Joi.validate(build, this.schema)
  }

  async save () {
    this.db.saveDatabase((err) => {
      if (err) { console.error('error saving', err) }
    })
  }

  async getBuilds (pr) {
    const builds = await this.builds.chain()
      .find({pr})
      .simplesort('id')
      .data()
    /* strip the $loki attribute */
    return builds.map((b) => {
      const {$loki, ...build} = b
      return build
    })
  }

  async addBuild (pr, build) {
    console.log(`Storing build for PR-${pr}: #${build.id} for ${build.platform}`)
    return await this.builds.insert({pr, ...build})
  }

  async addComment (pr, comment_id) {
    console.log(`Storing comment for PR-${pr}: ${comment_id}`)
    return await this.comments.insert({pr, comment_id})
  }

  async getCommentID (pr) {
    const rval = await this.comments.findOne({pr: pr})
    return rval ? rval.comment_id : null
  }
}

module.exports = Builds
