const log = require('loglevel')
const Joi = require('joi')
const Loki = require('lokijs')
const schema = require('./schema')

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

  /* This sorts so that builds are shown grouped by commit,
   * but still in chronological order based on $loki. */
  sortBuildsByCommit (builds) {
    let map = {}
    let bc = [], b
    /* put builds under commit keys */
    for (let i=0; i<builds.length; i++) {
      b = builds[i]
      if (map[b.commit] !== undefined) {
        bc[map[b.commit]].push(b)
      } else {
        bc.push([b])
        map[b.commit] = bc.length-1
      }
    }
    /* compare commits by their lowest $loki index */
    bc.sort((o1, o2) => {
      let o1_min = Math.min(o1.map((o) => o.$loki))
      let o2_min = Math.min(o2.map((o) => o.$loki))
      return o1_min - o2_min 
    })
    /* flatten */
    return [].concat.apply([], bc)
  }

  async getBuilds (pr) {
    let builds = await this.builds.chain()
      .find({pr})
      .compoundsort(['id', '$loki'])
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
    log.info(`Storing comment for PR-${pr}: ${comment_id}`)
    return await this.comments.insert({pr, comment_id})
  }

  async getCommentID (pr) {
    const rval = await this.comments.findOne({pr: pr})
    return rval ? rval.comment_id : null
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
