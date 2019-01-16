const expect = require('chai').expect
const sinon = require('sinon')

const sample = require('./sample')
const Builds = require('../src/builds')
const Comments = require('../src/comments')

let comments, client, builds

/* expected comment based on given builds */
const COMMENT = `
### Jenkins Builds
| :grey_question: | Commit | :hash: | Finished (UTC) | Duration | Platform | Result |
|-|-|-|-|-|-|-|
| :heavy_check_mark: | COMMIT-1 | [ID-1](URL-1) | 2018-12-20 08:26:33 | DURATION-1 | \`PLATFORM-1\` | [:package: package](PKG_URL-1) |
| | | | | | | |
| :x: | COMMIT-2 | [ID-2](URL-2) | 2018-12-20 08:45:28 | DURATION-2 | \`PLATFORM-2\` | [:page_facing_up: build log](URL-2consoleText) |
`

const COMMENT_FOLDED = `
### Jenkins Builds
<details>
<summary>Click to see older builds (2)</summary>

| :grey_question: | Commit | :hash: | Finished (UTC) | Duration | Platform | Result |
|-|-|-|-|-|-|-|
| :heavy_check_mark: | COMMIT-1 | [ID-1](URL-1) | 2018-12-20 08:26:33 | DURATION-1 | \`PLATFORM-1\` | [:package: package](PKG_URL-1) |
| | | | | | | |
| :x: | COMMIT-2 | [ID-2](URL-2) | 2018-12-20 08:45:28 | DURATION-2 | \`PLATFORM-2\` | [:page_facing_up: build log](URL-2consoleText) |
</details>

| :grey_question: | Commit | :hash: | Finished (UTC) | Duration | Platform | Result |
|-|-|-|-|-|-|-|
| :heavy_check_mark: | COMMIT-3 | [ID-3](URL-3) | 2018-12-20 08:26:32 | DURATION-3 | \`PLATFORM-3\` | [:package: package](PKG_URL-3) |
| | | | | | | |
| :x: | COMMIT-4 | [ID-4](URL-4) | 2018-12-20 08:45:23 | DURATION-4 | \`PLATFORM-4\` | [:page_facing_up: build log](URL-4consoleText) |
`

describe('Comments', () => {
  beforeEach(() => {
    client = {
      issues: {
        createComment: sinon.stub().returns({ data: { id: 'ISSUE-ID' }}),
        updateComment: sinon.stub().returns({ data: { id: 'ISSUE-ID' }}),
      },
    }
    builds = sinon.createStubInstance(Builds, {
      getBuilds: sample.BUILDS.slice(0, 2),
    })
    comments = new Comments(client, 'owner', 'repo', builds)
  })
  
  describe('renderComment', () => {
    it('should fail with no builds', async () => {
      builds.getBuilds.returns([])
      expect(comments.renderComment('PR-ID')).rejectedWith('No builds exist for this PR')
    })

    it('should render less than 3 comments fully', async () => {
      let body = await comments.renderComment('PR-ID')
      expect(body).to.eq(COMMENT)
    })

    it('should render more than 3 comments folded', async () => {
      builds.getBuilds.returns(sample.BUILDS)
      let body = await comments.renderComment('PR-ID')
      expect(body).to.eq(COMMENT_FOLDED)
    })
  })

  describe('postComment', () => {
    it('should create a new comment', async () => {
      let id = await comments.postComment('PR-ID')
      expect(id).to.eq('ISSUE-ID')
      expect(client.issues.createComment).calledOnceWith({
        body: sinon.match.any,
        number: 'PR-ID',
        owner: 'owner',
        repo: 'repo',
      })
    })
  })

  describe('updateComment', () => {
    it('should update existing comment', async () => {
      let id = await comments.updateComment('PR-ID', 'COMMENT-ID')
      expect(id).to.eq('ISSUE-ID')
      expect(client.issues.updateComment).calledOnceWith({
        body: sinon.match.any,
        comment_id: 'COMMENT-ID',
        owner: 'owner',
        repo: 'repo',
      })
    })
  })
})
