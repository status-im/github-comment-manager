import { expect } from 'chai'
import sinon from 'sinon'
import Octokit from '@octokit/rest'

import Builds from '../src/builds'
import Comments from '../src/comments'

let comments, client, builds

describe('Comments', () => {
  before(() => {
    //client = sinon.createStubInstance(Octokit, {what: 2})
    builds = sinon.createStubInstance(Builds, {
      getBuilds: []
    })
    comments = new Comments(client, 'owner', 'repo', builds)
  })
  
  describe('renderComment', () => {
    it('should fail with no builds', async () => {
      try {
        await comments.renderComment('PR')
      } catch(err) {
        expect(err.message).to.eq('No builds exist for this PR')
      }
    })
  })
})
