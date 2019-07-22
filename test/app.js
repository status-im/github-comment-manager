const expect = require('chai').expect
const sinon = require('sinon')
const request = require('supertest')

const sample = require('./sample')
const App = require('../src/app')
const Builds = require('../src/builds')
const Comments = require('../src/comments')

let ghc, app

describe('App', () => {
  beforeEach(() => {
    ghc = sinon.createStubInstance(Comments)
    ghc.db = sinon.createStubInstance(Builds, {
      getComments: sample.COMMENTS,
    }),
    app = App({ghc})
  })

  describe('GET /health', () => {
    it('should return OK', async () => {
      const resp = await request(app.callback())
        .get('/health')
      expect(resp.text).to.eq('OK')
      expect(resp.status).to.eq(200)
    })
  })

  describe('GET /comments', () => {
    it('should return list of builds', async () => {
      const resp = await request(app.callback())
        .get('/comments')
      expect(resp.body).to.eql({
        count: sample.COMMENTS.length, comments: sample.COMMENTS
      })
      expect(resp.status).to.eq(200)
    })
  })

  describe('POST /builds/:repo/:pr', () => {
    it('should store the POSTed build', async () => {
      const resp = await request(app.callback())
        .post('/builds/REPO-1/PR-1')
        .send(sample.BUILD)
      expect(resp.body).to.eql({status:'ok'})
      expect(resp.status).to.eq(201)
      expect(ghc.db.addBuild).calledOnceWith({
        repo: 'REPO-1', pr: 'PR-1', build: sample.BUILD,
      })
      expect(ghc.safeUpdate).calledOnceWith({
        repo: 'REPO-1', pr: 'PR-1'
      })
    })
  })


  describe('POST /builds/:repo/:pr/refresh', () => {
    it('should update github comment', async () => {
      const resp = await request(app.callback())
        .post('/builds/REPO-1/PR-1/refresh')
        .send(sample.BUILD)
      expect(resp.body).to.eql({status:'ok'})
      expect(resp.status).to.eq(201)
      expect(ghc.db.addBuild).not.calledOnceWith({
        repo: 'REPO-1', pr: 'PR-1', build: sample.BUILD
      })
      expect(ghc.safeUpdate).calledOnceWith({
        repo: 'REPO-1', pr: 'PR-1',
      })
    })
  })
})
