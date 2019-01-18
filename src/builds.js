const log = require('loglevel')
const Joi = require('joi')
const Loki = require('lokijs')
const AwaitLock = require('await-lock')
const schema = require('./schema')

class Builds {
  constructor(path, interval) {
    this.schema = schema
    this.lock = new AwaitLock()
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

  /* This sorts so that builds are shown grouped by commit,
   * but still in chronological order based on $loki. */
  sortBuildsByCommit (builds) {
    let map = {}
    let bc = [], b
    /* Put builds under commit keys to keep them together.
     * Keep the order of which commit appears first */
    for (let i=0; i<builds.length; i++) {
      b = builds[i]
      if (map[b.commit] !== undefined) {
        bc[map[b.commit]].push(b)
      } else {
        bc.push([b])
        map[b.commit] = bc.length-1
      }
    }
    /* flatten */
    return [].concat.apply([], bc)
  }

  async getBuilds (pr) {
    let builds = await this.builds.chain()
      .find({pr})
      .compoundsort(['$loki'])
      .data()
    /* sort groups of builds for commit based on $loki */
    builds = this.sortBuildsByCommit(builds)
    /* strip the $loki attribute */
    return builds.map((b) => {
      const {$loki, ...build} = b
      return build
    })
  }

  async addBuild (pr, build) {
    log.info(`Storing build for PR-${pr}: #${build.id} for ${build.platform}`)
    return await this.builds.insert({pr, ...build})
  }

  async addComment (pr, comment_id) {
    await this.lock.acquireAsync()
    try {
      log.info(`Storing comment for PR-${pr}: ${comment_id}`)
      return await this.comments.insert({pr, comment_id})
    } finally {
      this.lock.release()
    }
  }

  async getCommentID (pr) {
    await this.lock.acquireAsync()
    try {
      const rval = await this.comments.findOne({pr: pr})
      return rval ? rval.comment_id : null
    } finally {
      this.lock.release()
    }
  }

  async getComments (pr) {
    const comments = await this.comments.chain().simplesort('pr').data();
    /* strip the loki attributes */
    return comments.map((c) => {
      const {$loki, meta, ...comment} = c
      return comment
    })
  }
}

module.exports = Builds
