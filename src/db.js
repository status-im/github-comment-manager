import log from 'loglevel'
import Joi from 'joi'
import { Level } from 'level'

const pad = (id, width) => String(id).replace(/[#PR]/g, '').padStart(width, '0')

const kBuild = ({org, repo, pr, ts, id}) => `build!${org}!${repo}!${pad(pr, 6)}!${ts}!${pad(id, 8)}`
const kBuildPrefix = ({org, repo, pr}) => `build!${org}!${repo}!${pad(pr, 6)}`
const kComment = ({org, repo, pr}) => `comment!${org}!${repo}!${pad(pr, 6)}`

class DB {
  constructor(path) {
    this.db = new Level(path, { valueEncoding: 'json' })
  }

  /* This sorts so that builds are shown grouped by commit,
   * but still in chronological order based on timestamp. */
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

  async getAllForPrefix (prefix) {
    let out = {}
    for await (const [key, value] of this.db.iterator({
      gte: prefix, lt: prefix + '\uffff',
    })) {
      out[key] = value
    }
    return out
  }

  async getBuilds () {
    return await this.getAllForPrefix('build!')
  }

  async getPRBuilds (query) {
    let builds = await this.getAllForPrefix(kBuildPrefix(query))
    return this.sortBuildsByCommit(Object.values(builds))
  }

  async removeBuilds ({org, repo, pr}) {
    log.info(`Removing builds for ${org}/${repo}#${pr}`)
    const builds = await this.getAllForPrefix(kBuildPrefix({org, repo, pr}))
    const keys = Object.keys(builds)
    await this.db.batch(keys.map(k => ({type: 'del', key: k})))
    return keys
  }

  async addBuild ({org, repo, pr, build}) {
    log.info(`Storing build for ${org}/${repo}#${pr}: #${build.id} for ${build.platform}`)
    const ts = Date.now()
    build['created'] = ts
    return await this.db.put(kBuild({org, repo, pr, ts, id: build.id}), build, {sync:true})
  }

  async addComment ({org, repo, pr, id}) {
    log.info(`Storing comment for ${org}/${repo}#${pr}: ${id}`)
    return await this.db.put(kComment({org, repo, pr}), id, {sync:true})
  }

  async getCommentID (obj) {
    return await this.db.get(kComment(obj))
  }

  async getComments () {
    return this.getAllForPrefix('comment!')
  }
}

export default DB
