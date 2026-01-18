import tmp from 'tmp'
import { expect } from 'chai'
import sinon from 'sinon'

import sample from './sample.js'
import DB from '../src/db.js'

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

tmp.setGracefulCleanup()

const BUILDS = [
  {...sample.BUILD, id: 1, name: '#1', commit: 'abcd1234', platform: 'macos'},
  {...sample.BUILD, id: 2, name: '#2', commit: '1234abcd', platform: 'macos'},
  {...sample.BUILD, id: 1, name: '#1', commit: 'abcd1234', platform: 'linux'},
  {...sample.BUILD, id: 2, name: '#2', commit: 'abcd1234', platform: 'linux'},
  {...sample.BUILD, id: 3, name: '#3', commit: '1234abcd', platform: 'linux'},
  {...sample.BUILD, id: 1, name: '#1', commit: 'abcd1234', platform: 'windows'},
  {...sample.BUILD, id: 2, name: '#2', commit: '1234abcd', platform: 'windows'},
]

let dbDir, db

describe('Builds', () => {
  before(() => {
    dbDir = tmp.dirSync({mode: 0o750, prefix: 'level.db'})
    db = new DB(dbDir.name)
  })

  after(() => {
    db.db.close()
  })

  describe('getBuilds', () => {
    before(async () => {
      /* need to add the builds before they can be sorted */
      for (let i=0; i<BUILDS.length; i++) {
        let b = BUILDS[i]
        await db.addBuild({repo: 'REPO-1', pr: 1, build: b})
      }
      /* verify the builds were added */
      expect(BUILDS.length).to.equal(Object.keys(await db.getBuilds()).length)
    })

    it('should sort by commits and ids', async () => {
      let rval = await db.getPRBuilds({repo: 'REPO-1', pr: 1})
      /* remove fields we don't care about for easier comparison */
      rval = rval.map((b) => {
        const { id, name, commit, platform } = b
        return { id, name, commit, platform }
      })
      /* compare lists without requiring ordering */
      expect(rval).to.deep.equal([
        { id: 1, name: '#1', commit: 'abcd1234', platform: 'macos' },
        { id: 1, name: '#1', commit: 'abcd1234', platform: 'linux' },
        { id: 2, name: '#2', commit: 'abcd1234', platform: 'linux' },
        { id: 1, name: '#1', commit: 'abcd1234', platform: 'windows' },
        { id: 2, name: '#2', commit: '1234abcd', platform: 'macos' },
        { id: 3, name: '#3', commit: '1234abcd', platform: 'linux' },
        { id: 2, name: '#2', commit: '1234abcd', platform: 'windows' },
      ])
    })
  })
})
