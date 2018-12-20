import { expect } from 'chai'
import sinon from 'sinon'
import request from 'supertest'

import sample from './sample'
import App from '../src/app'
import Builds from '../src/builds'
import Comments from '../src/comments'

let ghc, app

describe('App', () => {
  beforeEach(() => {
    ghc = sinon.createStubInstance(Comments)
    ghc.db = sinon.createStubInstance(Builds, {
      getComments: sample.COMMENTS,
    }),
    app = App(ghc)
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

  describe('POST /builds/:pr', () => {
    it('should store the POSTed build', async () => {
      const resp = await request(app.callback())
        .post('/builds/PR-1')
        .send(sample.BUILD)
      expect(resp.body).to.eql({status:'ok'})
      expect(resp.status).to.eq(201)
      expect(ghc.db.addBuild).calledOnceWith('PR-1', sample.BUILD)
      expect(ghc.update).calledOnceWith('PR-1')
    })
  })


  describe('POST /builds/:pr/refresh', () => {
    it('should update github comment', async () => {
      const resp = await request(app.callback())
        .post('/builds/PR-1/refresh')
        .send(sample.BUILD)
      expect(resp.body).to.eql({status:'ok'})
      expect(resp.status).to.eq(201)
      expect(ghc.db.addBuild).not.calledOnceWith('PR-1', sample.BUILD)
      expect(ghc.update).calledOnceWith('PR-1')
    })
  })
})
