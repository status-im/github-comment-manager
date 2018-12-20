import { expect } from 'chai'
import sinon from 'sinon'
import request from 'supertest'

import App from '../src/app'
import Builds from '../src/builds'
import Comments from '../src/comments'

let comments
let app
const COMMENTS = [
  { pr: 'PR-1', comment_id: 1234 },
  { pr: 'PR-2', comment_id: 4321 },
  { pr: 'PR-3', comment_id: 9753 },
]

describe('App', () => {
  beforeEach(() => {
    comments = sinon.createStubInstance(Comments)
    comments.db = sinon.createStubInstance(Builds, {
      getComments: COMMENTS,
    }),
    app = App(comments)
  })

  describe('/health', () => {
    it('should return OK', async () => {
      const resp = await request(app.callback()).get('/health')
      expect(resp.text).to.eq('OK')
      expect(resp.status).to.eq(200)
    })
  })

  describe('/comments', () => {
    it('should return list of builds', async () => {
      const resp = await request(app.callback()).get('/comments')
      expect(resp.body).to.eql({ count: COMMENTS.length, comments: COMMENTS})
      expect(resp.status).to.eq(200)
    })
  })
})
