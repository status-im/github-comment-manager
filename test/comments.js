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
| :heavy_check_mark: | COMMIT-0 | [ID-1](URL-1) | 2018-12-20 08:25:56 | DURATION-1 | \`PLATFORM-1\` | [:package: package](PKG_URL-1) |
| :heavy_check_mark: | COMMIT-0 | [ID-2](URL-2) | 2018-12-20 08:26:53 | DURATION-2 | \`PLATFORM-2\` | [:package: package](PKG_URL-2) |
`

const COMMENT_FOLDED = `
### Jenkins Builds
<details>
<summary>Click to see older builds (7)</summary>

| :grey_question: | Commit | :hash: | Finished (UTC) | Duration | Platform | Result |
|-|-|-|-|-|-|-|
| :heavy_check_mark: | COMMIT-0 | [ID-1](URL-1) | 2018-12-20 08:25:56 | DURATION-1 | \`PLATFORM-1\` | [:package: package](PKG_URL-1) |
| :heavy_check_mark: | COMMIT-0 | [ID-2](URL-2) | 2018-12-20 08:26:53 | DURATION-2 | \`PLATFORM-2\` | [:package: package](PKG_URL-2) |
| :x: | COMMIT-0 | [ID-3](URL-3) | 2018-12-20 08:27:50 | DURATION-3 | \`PLATFORM-3\` | [:page_facing_up: build log](URL-3consoleText) |
| | | | | | | |
| :heavy_check_mark: | COMMIT-1 | [ID-4](URL-4) | 2018-12-20 08:28:47 | DURATION-4 | \`PLATFORM-4\` | [:package: package](PKG_URL-4) |
| :heavy_check_mark: | COMMIT-1 | [ID-5](URL-5) | 2018-12-20 08:29:43 | DURATION-5 | \`PLATFORM-5\` | [:package: package](PKG_URL-5) |
| :x: | COMMIT-1 | [ID-6](URL-6) | 2018-12-20 08:30:40 | DURATION-6 | \`PLATFORM-6\` | [:page_facing_up: build log](URL-6consoleText) |
| :heavy_check_mark: | COMMIT-1 | [ID-7](URL-7) | 2018-12-20 08:31:37 | DURATION-7 | \`PLATFORM-7\` | [:package: package](PKG_URL-7) |
</details>

| :grey_question: | Commit | :hash: | Finished (UTC) | Duration | Platform | Result |
|-|-|-|-|-|-|-|
| :heavy_check_mark: | COMMIT-2 | [ID-8](URL-8) | 2018-12-20 08:32:34 | DURATION-8 | \`PLATFORM-8\` | [:package: package](PKG_URL-8) |
| :x: | COMMIT-2 | [ID-9](URL-9) | 2018-12-20 08:33:31 | DURATION-9 | \`PLATFORM-9\` | [:page_facing_up: build log](URL-9consoleText) |
| :heavy_check_mark: | COMMIT-2 | [ID-10](URL-10) | 2018-12-20 08:34:27 | DURATION-10 | \`PLATFORM-10\` | [:package: package](PKG_URL-10) |
| :heavy_check_mark: | COMMIT-2 | [ID-11](URL-11) | 2018-12-20 08:35:24 | DURATION-11 | \`PLATFORM-11\` | [:package: package](PKG_URL-11) |
| | | | | | | |
| :x: | COMMIT-3 | [ID-12](URL-12) | 2018-12-20 08:36:21 | DURATION-12 | \`PLATFORM-12\` | [:page_facing_up: build log](URL-12consoleText) |
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
