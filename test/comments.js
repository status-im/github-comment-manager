import { expect } from 'chai'
import sinon from 'sinon'

import sample from './sample.js'
import Builds from '../src/builds.js'
import Comments from '../src/comments.js'

let comments, client, builds

/* expected comment based on given builds */
const COMMENT = `
### Jenkins Builds
| :grey_question: | Commit | :hash: | Finished (UTC) | Duration | Platform | Result |
|-|-|-|-|-|-|-|
| :heavy_check_mark: | COMMIT-0 | [ID-1](URL-1/) | 2018-12-20 08:25:56 | DURATION-1 | \`PLATFORM-1\` | [:robot:\`apk\`](https://example.org/StatusIm-123-456-abc-pr.apk) [:calling:](https://quickchart.io/qr?text=https%3A%2F%2Fexample.org%2FStatusIm-123-456-abc-pr.apk&size=400x400&errorCorrectionLevel=L)|
| :heavy_check_mark: | COMMIT-0 | [ID-2](URL-2/) | 2018-12-20 08:26:53 | DURATION-2 | \`PLATFORM-2\` | [:cd:\`exe\`](https://example.org/StatusIm-123-456-abc-pr.exe) |
`

const COMMENT_FOLDED = `
### Jenkins Builds
<details>
<summary>Click to see older builds (7)</summary>

| :grey_question: | Commit | :hash: | Finished (UTC) | Duration | Platform | Result |
|-|-|-|-|-|-|-|
| :heavy_check_mark: | COMMIT-0 | [ID-1](URL-1/) | 2018-12-20 08:25:56 | DURATION-1 | \`PLATFORM-1\` | [:robot:\`apk\`](https://example.org/StatusIm-123-456-abc-pr.apk) [:calling:](https://quickchart.io/qr?text=https%3A%2F%2Fexample.org%2FStatusIm-123-456-abc-pr.apk&size=400x400&errorCorrectionLevel=L)|
| :heavy_check_mark: | COMMIT-0 | [ID-2](URL-2/) | 2018-12-20 08:26:53 | DURATION-2 | \`PLATFORM-2\` | [:cd:\`exe\`](https://example.org/StatusIm-123-456-abc-pr.exe) |
| :x: | COMMIT-0 | [ID-3](URL-3/) | 2018-12-20 08:27:50 | DURATION-3 | \`PLATFORM-3\` | [:page_facing_up:\`log\`](URL-3/consoleText) |
| | | | | | | |
| :heavy_check_mark: | COMMIT-1 | [ID-4](URL-4/) | 2018-12-20 08:28:47 | DURATION-4 | \`PLATFORM-4\` | [:package:\`App\`](https://example.org/StatusIm-123-456-abc-pr.AppImage) |
| :heavy_check_mark: | COMMIT-1 | [ID-5](URL-5/) | 2018-12-20 08:29:43 | DURATION-5 | \`PLATFORM-5\` | [:iphone:\`ipa\`](https://i.diawi.com/ABCDxyz1) [:calling:](https://quickchart.io/qr?text=https%3A%2F%2Fi.diawi.com%2FABCDxyz1&size=400x400&errorCorrectionLevel=L)|
| :heavy_multiplication_x: | COMMIT-1 | [ID-6](URL-6/) | 2018-12-20 08:30:40 | DURATION-6 | \`PLATFORM-6\` | [:package:\`pkg\`](https://unknown.example.org/path/package) |
| :interrobang: | COMMIT-1 | [ID-7](URL-7/) | 2018-12-20 08:31:37 | DURATION-7 | \`PLATFORM-7\` | [:page_facing_up:\`log\`](URL-7/consoleText) |
</details>

| :grey_question: | Commit | :hash: | Finished (UTC) | Duration | Platform | Result |
|-|-|-|-|-|-|-|
| :heavy_check_mark: | COMMIT-2 | [ID-8](URL-8/) | 2018-12-20 08:32:34 | DURATION-8 | \`PLATFORM-8\` | [:package:\`tgz\`](https://example.org/StatusIm-123-456-abc-pr.tar.gz) |
| :heavy_multiplication_x: | COMMIT-2 | [ID-9](URL-9/) | 2018-12-20 08:33:31 | DURATION-9 | \`PLATFORM-9\` | [:robot:\`apk\`](https://example.org/StatusIm-123-456-abc-pr.apk) [:calling:](https://quickchart.io/qr?text=https%3A%2F%2Fexample.org%2FStatusIm-123-456-abc-pr.apk&size=400x400&errorCorrectionLevel=L)|
| :heavy_check_mark: | COMMIT-2 | [ID-10](URL-10/) | 2018-12-20 08:34:27 | DURATION-10 | \`PLATFORM-10\` | [:cd:\`exe\`](https://example.org/StatusIm-123-456-abc-pr.exe) |
| :interrobang: | COMMIT-2 | [ID-11](URL-11/) | 2018-12-20 08:35:24 | DURATION-11 | \`PLATFORM-11\` | [:page_facing_up:\`log\`](URL-11/consoleText) |
| | | | | | | |
| :heavy_multiplication_x: | COMMIT-3 | [ID-12](URL-12/) | 2018-12-20 08:36:21 | DURATION-12 | \`PLATFORM-12\` | [:package:\`App\`](https://example.org/StatusIm-123-456-abc-pr.AppImage) |
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
    comments = new Comments({
      client: client,
      owner: 'owner',
      repos: ['repo'],
      builds: builds
    })
  })

  describe('_renderComment', () => {
    it('should fail with no builds', async () => {
      builds.getBuilds.returns([])
      expect(comments._renderComment('PR-ID')).rejectedWith('No builds exist for this PR')
    })

    it('should render less than 3 comments fully', async () => {
      let body = await comments._renderComment('PR-ID')
      expect(body).to.eq(COMMENT)
    })

    it('should render more than 3 comments folded', async () => {
      builds.getBuilds.returns(sample.BUILDS)
      let body = await comments._renderComment('PR-ID')
      expect(body).to.eq(COMMENT_FOLDED)
    })
  })

  describe('_postComment', () => {
    it('should create a new comment', async () => {
      let id = await comments._postComment({
        repo: 'REPO-1', pr: 'PR-ID',
      })
      expect(id).to.eq('ISSUE-ID')
      expect(client.issues.createComment).calledOnceWith({
        body: sinon.match.any,
        owner: 'owner',
        issue_number: 'PR-ID',
        repo: 'REPO-1',
      })
    })
  })

  describe('_updateComment', () => {
    it('should update existing comment', async () => {
      let id = await comments._updateComment({
        repo: 'REPO-1', pr: 'PR-ID', comment_id: 'COMMENT-ID',
      })
      expect(id).to.eq('ISSUE-ID')
      expect(client.issues.updateComment).calledOnceWith({
        body: sinon.match.any,
        owner: 'owner',
        comment_id: 'COMMENT-ID',
        repo: 'REPO-1',
      })
    })
  })
})
