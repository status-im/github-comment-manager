import { expect } from 'chai'
import sinon from 'sinon'
import request from 'supertest'

import sample from './sample'
import App from '../src/app'
import Builds from '../src/builds'
import Comments from '../src/comments'

let comments, app

describe('App', () => {
  beforeEach(() => {
    comments = sinon.createStubInstance(Comments)
    comments.db = sinon.createStubInstance(Builds, {
      getComments: sample.COMMENTS,
    }),
    app = App(comments)
  })

  describe('GET /health', () => {
    it('should return OK', async () => {
      const resp = await request(app.callback()).get('/health')
      expect(resp.text).to.eq('OK')
      expect(resp.status).to.eq(200)
    })
  })

  describe('GET /comments', () => {
    it('should return list of builds', async () => {
      const resp = await request(app.callback()).get('/comments')
      expect(resp.body).to.eql({
        count: sample.COMMENTS.length, comments: sample.COMMENTS
      })
      expect(resp.status).to.eq(200)
    })
  })
})
