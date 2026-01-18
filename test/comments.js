import { expect } from 'chai'
import sinon from 'sinon'

import sample from './sample.js'
import DB from '../src/db.js'
import Comments from '../src/comments.js'

/* Globals used across tests. */
let comments, client, db

/* expected comment based on given builds */
const COMMENT = `
### Jenkins Builds
| :grey_question: | Commit | :hash: | Finished (UTC) | Duration | Platform | Result |
|-|-|-|-|-|-|-|
| :heavy_check_mark: | COMMIT-0 | [1](URL-1/) | 2018-12-20 08:25:56 | DURATION-1 | \`PLATFORM-1\` | [:robot:\`apk\`](https://example.org/StatusIm-123-456-abc-pr.apk) [:calling:](https://quickchart.io/qr?text=https%3A%2F%2Fexample.org%2FStatusIm-123-456-abc-pr.apk&size=400x400&errorCorrectionLevel=L)|
| :heavy_check_mark: | COMMIT-0 | [2](URL-2/) | 2018-12-20 08:26:53 | DURATION-2 | \`PLATFORM-2\` | [:cd:\`exe\`](https://example.org/StatusIm-123-456-abc-pr.exe) |
`

const COMMENT_FOLDED = `
### Jenkins Builds
<details>
<summary>Click to see older builds (7)</summary>

| :grey_question: | Commit | :hash: | Finished (UTC) | Duration | Platform | Result |
|-|-|-|-|-|-|-|
| :heavy_check_mark: | COMMIT-0 | [1](URL-1/) | 2018-12-20 08:25:56 | DURATION-1 | \`PLATFORM-1\` | [:robot:\`apk\`](https://example.org/StatusIm-123-456-abc-pr.apk) [:calling:](https://quickchart.io/qr?text=https%3A%2F%2Fexample.org%2FStatusIm-123-456-abc-pr.apk&size=400x400&errorCorrectionLevel=L)|
| :heavy_check_mark: | COMMIT-0 | [2](URL-2/) | 2018-12-20 08:26:53 | DURATION-2 | \`PLATFORM-2\` | [:cd:\`exe\`](https://example.org/StatusIm-123-456-abc-pr.exe) |
| :x: | COMMIT-0 | [3](URL-3/) | 2018-12-20 08:27:50 | DURATION-3 | \`PLATFORM-3\` | [:page_facing_up:\`log\`](URL-3/consoleText) |
| | | | | | | |
| :heavy_check_mark: | COMMIT-1 | [4](URL-4/) | 2018-12-20 08:28:47 | DURATION-4 | \`PLATFORM-4\` | [:package:\`App\`](https://example.org/StatusIm-123-456-abc-pr.AppImage) |
| :heavy_check_mark: | COMMIT-1 | [5](URL-5/) | 2018-12-20 08:29:43 | DURATION-5 | \`PLATFORM-5\` | [:iphone:\`ipa\`](https://i.diawi.com/ABCDxyz1) [:calling:](https://quickchart.io/qr?text=https%3A%2F%2Fi.diawi.com%2FABCDxyz1&size=400x400&errorCorrectionLevel=L)|
| :heavy_multiplication_x: | COMMIT-1 | [6](URL-6/) | 2018-12-20 08:30:40 | DURATION-6 | \`PLATFORM-6\` | [:package:\`pkg\`](https://unknown.example.org/path/package) |
| :interrobang: | COMMIT-1 | [7](URL-7/) | 2018-12-20 08:31:37 | DURATION-7 | \`PLATFORM-7\` | [:page_facing_up:\`log\`](URL-7/consoleText) |
</details>

| :grey_question: | Commit | :hash: | Finished (UTC) | Duration | Platform | Result |
|-|-|-|-|-|-|-|
| :heavy_check_mark: | COMMIT-2 | [8](URL-8/) | 2018-12-20 08:32:34 | DURATION-8 | \`PLATFORM-8\` | [:package:\`tgz\`](https://example.org/StatusIm-123-456-abc-pr.tar.gz) |
| :heavy_multiplication_x: | COMMIT-2 | [9](URL-9/) | 2018-12-20 08:33:31 | DURATION-9 | \`PLATFORM-9\` | [:bar_chart:\`rpt\`](https://ci.example.org/job/path/allure/) |
| :heavy_check_mark: | COMMIT-2 | [10](URL-10/) | 2018-12-20 08:34:27 | DURATION-10 | \`PLATFORM-10\` | [:robot:\`apk\`](https://example.org/StatusIm-123-456-abc-pr.apk) [:calling:](https://quickchart.io/qr?text=https%3A%2F%2Fexample.org%2FStatusIm-123-456-abc-pr.apk&size=400x400&errorCorrectionLevel=L)|
| :heavy_check_mark: | COMMIT-2 | [11](URL-11/) | 2018-12-20 08:35:24 | DURATION-11 | \`PLATFORM-11\` | [:cd:\`exe\`](https://example.org/StatusIm-123-456-abc-pr.exe) |
| | | | | | | |
| :x: | COMMIT-3 | [12](URL-12/) | 2018-12-20 08:36:21 | DURATION-12 | \`PLATFORM-12\` | [:page_facing_up:\`log\`](URL-12/consoleText) |
`

describe('Comments', () => {
  beforeEach(() => {
    client = {
      issues: {
        createComment: sinon.stub().returns({ data: { id: 'ISSUE-ID' }}),
        updateComment: sinon.stub().returns({ data: { id: 'ISSUE-ID' }}),
      },
    }
    db = sinon.createStubInstance(DB, {
      getPRBuilds: sample.getBuildsWithCommits([2]),
    })
    comments = new Comments({
      client: client,
      owner: 'owner',
      repos: ['repo'],
      db: db
    })
  })

  describe('_renderComment', () => {
    it('should fail with no builds', async () => {
      db.getPRBuilds.returns([])
      expect(comments._renderComment('PR-ID')).rejectedWith('No builds exist for this PR')
    })

    it('should show single commit in full even if >12 builds', async () => {
      // 15 builds for one commit - should show all without folding
      const manyBuilds = sample.getBuildsWithCommits([15])
      db.getPRBuilds.returns(manyBuilds)
      let body = await comments._renderComment({repo: 'test-repo', pr: 'PR-ID'})
      expect(body).to.include('COMMIT-0')
      expect(body).to.not.include('<details>')
    })

    it('should render a single comment fully', async () => {
      let body = await comments._renderComment('PR-ID')
      expect(body).to.eq(COMMENT)
    })

    it('should render 2 out of 4 commits', async () => {
      db.getPRBuilds.returns(sample.BUILDS)
      let body = await comments._renderComment('PR-ID')
      expect(body).to.eq(COMMENT_FOLDED)
    })

    it('should show last two commits if they fit within 12', async () => {
      // 2 commits with 5 builds each (10 total) - should show both
      const twoCommits = sample.getBuildsWithCommits([5, 5])
      db.getPRBuilds.returns(twoCommits)
      let body = await comments._renderComment({repo: 'test-repo', pr: 'PR-ID'})
      expect(body).to.include('COMMIT-0')
      expect(body).to.include('COMMIT-1')
      expect(body).to.not.include('<details>')
    })

    it('should fold when last two commits exceed 12', async () => {
      // 2 commits with 10 builds each (20 total) - should show only last commit
      const manyBuilds = sample.getBuildsWithCommits([10, 10])
      db.getPRBuilds.returns(manyBuilds)
      let body = await comments._renderComment({repo: 'test-repo', pr: 'PR-ID'})
      expect(body).to.include('COMMIT-1')
      expect(body).to.include('<details>')
      expect(body).to.include('Click to see older builds (10)')
    })

    it('should show exactly 12 builds without folding', async () => {
      // 1 commit with 12 builds exactly
      const twelveBuilds = sample.getBuildsWithCommits([12])
      db.getPRBuilds.returns(twelveBuilds)
      let body = await comments._renderComment({repo: 'test-repo', pr: 'PR-ID'})
      expect(body).to.not.include('<details>')
    })

    it('should show last two commits when they exactly hit limit', async () => {
      // 3 commits: 5, 6, 6 builds (17 total) - should show last two (12 builds)
      const threeCommits = sample.getBuildsWithCommits([5, 6, 6])
      db.getPRBuilds.returns(threeCommits)
      let body = await comments._renderComment({repo: 'test-repo', pr: 'PR-ID'})
      expect(body).to.include('COMMIT-1')
      expect(body).to.include('COMMIT-2')
      expect(body).to.include('<details>')
      expect(body).to.include('Click to see older builds (5)')
    })

    it('should show only last two commits even when three would fit', async () => {
      // 3 commits with 2 builds each (6 total) - should show only last two commits
      const threeSmallCommits = sample.getBuildsWithCommits([2, 2, 2])
      db.getPRBuilds.returns(threeSmallCommits)
      let body = await comments._renderComment({repo: 'test-repo', pr: 'PR-ID'})
      expect(body).to.include('COMMIT-1')
      expect(body).to.include('COMMIT-2')
      expect(body).to.include('<details>')
      expect(body).to.include('Click to see older builds (2)')
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
        repo: 'REPO-1', pr: 'PR-ID', id: 'COMMENT-ID',
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
