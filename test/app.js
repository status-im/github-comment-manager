import { expect } from 'chai'
import sinon from 'sinon'
import request from 'supertest'

import sample from './sample.js'
import App from '../src/app.js'
import Builds from '../src/builds.js'
import Comments from '../src/comments.js'

let ghc, app

describe('App', () => {
  beforeEach(() => {
    ghc = sinon.createStubInstance(Comments)
    ghc.db = sinon.createStubInstance(Builds, {
      getComments: sample.COMMENTS,
      getBuilds: sample.BUILDS,
    }),
    app = App({ghc})
  })

  describe('GET /', () => {
    it('should redirect to main site', async () => {
      const resp = await request(app.callback()).get('/')
      expect(resp.status).to.eq(302)
      expect(resp.headers.location).to.eq('https://status.im/')
    })
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
    it('should return list of comments', async () => {
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

  describe('GET /builds/:repo/:pr', () => {
    it('should return list of builds', async () => {
      const resp = await request(app.callback())
        .get('/builds/REPO-1/PR-1')
      expect(resp.body).to.eql({
        count: sample.BUILDS.length, builds: sample.BUILDS,
      })
      expect(resp.status).to.eq(200)
    })
  })

  describe('DELETE /builds/:repo/:pr', () => {
    it('should delete all matching builds', async () => {
      const resp = await request(app.callback())
        .delete('/builds/REPO-1/PR-1')
      expect(resp.body).to.eql({})
      expect(resp.status).to.eq(200)
      expect(ghc.db.removeBuilds).calledOnceWith({
        repo: 'REPO-1', pr: 'PR-1',
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
