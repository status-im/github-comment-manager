import { expect } from 'chai'
import sinon from 'sinon'
import request from 'supertest'

import App from '../src/app'
import Builds from '../src/builds'
import Comments from '../src/comments'

let comments
let app

describe('App', () => {
  beforeEach(() => {
    comments = sinon.createStubInstance(Comments)
    comments.db = sinon.createStubInstance(Builds),
    app = App(comments)
  })

  describe('/health', () => {
    it('should return OK', async () => {
      let resp = await request(app.callback()).get('/health')
      expect(resp.text).to.eq('OK')
      expect(resp.status).to.eq(200)
    })
  })
})
