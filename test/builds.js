const tmp = require('tmp')
const expect = require('chai').expect
const sinon = require('sinon')

const sample = require('./sample')
const Builds = require('../src/builds')

tmp.setGracefulCleanup()

const BUILDS = [
  {...sample.BUILD, id: '#1', commit: 'abcd1234', platform: 'macos'},
  {...sample.BUILD, id: '#2', commit: '1234abcd', platform: 'macos'},
  {...sample.BUILD, id: '#1', commit: 'abcd1234', platform: 'linux'},
  {...sample.BUILD, id: '#2', commit: 'abcd1234', platform: 'linux'},
  {...sample.BUILD, id: '#3', commit: '1234abcd', platform: 'linux'},
  {...sample.BUILD, id: '#1', commit: 'abcd1234', platform: 'windows'},
  {...sample.BUILD, id: '#2', commit: '1234abcd', platform: 'windows'},
]

let builds, db

describe('Builds', () => {
  before(() => {
    db = tmp.fileSync({keep: false})
    builds = new Builds(db.name, 999)
    builds.initDB()
  })

  after(() => {
    builds.db.close()
    db.removeCallback()
  })

  describe('getBuilds', () => {
    before(async () => {
      /* need to add the builds before they can be sorted */
      for (let i=0; i<BUILDS.length; i++) {
        let b = BUILDS[i]
        await builds.addBuild('PR-1', b)
        /* verify the build was added */
        let rval = await builds.builds.findOne({id: b.id, platform: b.platform})
        expect(rval.commit).to.equal(BUILDS[i].commit)
      }
    })

    it('should sort by commits and ids', async () => {
      let rval = await builds.getBuilds('PR-1')
      /* remove fields we don't care about for easier comparison */
      rval = rval.map((b) => {
        const { pr, success, duration, url, pkg_url, meta, ...build } = b
        return build
      })
      expect(rval).to.deep.equal([
        { id: '#1', commit: 'abcd1234', platform: 'macos' },
        { id: '#1', commit: 'abcd1234', platform: 'linux' },
        { id: '#1', commit: 'abcd1234', platform: 'windows' },
        { id: '#2', commit: 'abcd1234', platform: 'linux' },
        { id: '#2', commit: '1234abcd', platform: 'macos' },
        { id: '#2', commit: '1234abcd', platform: 'windows' },
        { id: '#3', commit: '1234abcd', platform: 'linux' }
      ])
    })
  })
})
