import log from 'loglevel'
import Joi from 'joi'
import Loki from 'lokijs'

class Builds {
  constructor(path, interval) {
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

  async getBuilds (query) {
    let builds = await this.builds.chain()
      .find(query)
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

  async removeBuilds ({repo, pr}) {
    log.info(`Removing build for ${repo}/PR-${pr}`)
    return await this.builds.findAndRemove({repo, pr})
  }

  async addBuild ({repo, pr, build}) {
    log.info(`Storing build for ${repo}/PR-${pr}: #${build.id} for ${build.platform}`)
    return await this.builds.insert({repo, pr, ...build})
  }

  async addComment ({repo, pr, comment_id}) {
    log.info(`Storing comment for ${repo}/PR-${pr}: ${comment_id}`)
    return await this.comments.insert({repo, pr, comment_id})
  }

  async getCommentID (query) {
    const rval = await this.comments.findOne(query)
    return rval ? rval.comment_id : null
  }

  async getComments () {
    const comments = await this.comments.chain().simplesort('pr').data()
    /* strip the loki attributes */
    return comments.map((c) => {
      const {$loki, meta, ...comment} = c
      return comment
    })
  }
}

export default Builds
