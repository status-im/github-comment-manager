import { expect } from 'chai'
import sinon from 'sinon'
import request from 'supertest'

import sample from './sample.js'
import App from '../src/app.js'
import DB from '../src/db.js'
import Comments from '../src/comments.js'

let ghc, app

describe('App', () => {
  beforeEach(() => {
    ghc = sinon.createStubInstance(Comments)
    ghc.db = sinon.createStubInstance(DB, {
      getComments: sample.COMMENTS,
      getPRBuilds: sample.BUILDS,
      removeBuilds: sample.BUILDS,
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

  describe('POST /builds/:org/:repo/:pr', () => {
    it('should store the POSTed build', async () => {
      const resp = await request(app.callback())
        .post('/builds/ORG-1/REPO-1/PR-1')
        .send(sample.BUILD)
      expect(resp.body).to.eql({status:'ok'})
      expect(resp.status).to.eq(201)
      expect(ghc.db.addBuild).calledOnceWith({
        org: 'ORG-1', repo: 'REPO-1', pr: 'PR-1', build: sample.BUILD,
      })
      expect(ghc.safeUpdate).calledOnceWith({
        org: 'ORG-1', repo: 'REPO-1', pr: 'PR-1'
      })
    })
  })

  describe('GET /builds/:org/:repo/:pr', () => {
    it('should return list of builds', async () => {
      const resp = await request(app.callback())
        .get('/builds/ORG-1/REPO-1/PR-1')
      expect(resp.body).to.eql({
        count: sample.BUILDS.length, builds: sample.BUILDS,
      })
      expect(resp.status).to.eq(200)
    })
  })

  describe('DELETE /builds/:org/:repo/:pr', () => {
    it('should delete all matching builds', async () => {
      const resp = await request(app.callback())
        .delete('/builds/ORG-1/REPO-1/PR-1')
      expect(resp.body.count).to.eql(sample.BUILDS.length)
      expect(resp.status).to.eq(200)
      expect(ghc.db.removeBuilds).calledOnceWith({
        org: 'ORG-1', repo: 'REPO-1', pr: 'PR-1',
      })
    })
  })

  describe('POST /builds/:org/:repo/:pr/refresh', () => {
    it('should update github comment', async () => {
      const resp = await request(app.callback())
        .post('/builds/ORG-1/REPO-1/PR-1/refresh')
        .send(sample.BUILD)
      expect(resp.body).to.eql({status:'ok'})
      expect(resp.status).to.eq(201)
      expect(ghc.db.addBuild).not.calledOnceWith({
        org: 'ORG-1', repo: 'REPO-1', pr: 'PR-1', build: sample.BUILD
      })
      expect(ghc.safeUpdate).calledOnceWith({
        org: 'ORG-1', repo: 'REPO-1', pr: 'PR-1',
      })
    })
  })
})
