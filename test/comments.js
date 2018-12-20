import { expect } from 'chai'
import sinon from 'sinon'
import Octokit from '@octokit/rest'

import Builds from '../src/builds'
import Comments from '../src/comments'

let comments, client, builds

const BUILDS = [
  {
    id: 'ID-1',
    commit: 'COMMIT-1',
    success: true,
    platform: 'PLATFORM-1',
    duration: 'DURATION-1',
    url: 'URL-1',
    pkg_url: 'PKG_URL-1',
    meta: { created: 1545294393058 },
  },
  {
    id: 'ID-2',
    commit: 'COMMIT-2',
    success: false,
    platform: 'PLATFORM-2',
    duration: 'DURATION-2',
    url: 'URL-2',
    pkg_url: 'PKG_URL-2',
    meta: { created: 1545295528896 },
  },
]

/* expected comment based on given builds */
const COMMENT = `
### Jenkins Builds
| :grey_question: | Commit | :hash: | Finished (UTC) | Duration | Platform | Result |
|-|-|-|-|-|-|-|
| :heavy_check_mark: | COMMIT-1 | [ID-1](URL-1) | 2018-12-20 08:26:33 | DURATION-1 | \`PLATFORM-1\` | [:package: package](PKG_URL-1) |
| | | | | | | |
| :x: | COMMIT-2 | [ID-2](URL-2) | 2018-12-20 08:45:28 | DURATION-2 | \`PLATFORM-2\` | [:page_facing_up: build log](PKG_URL-2consoleText) |
`

describe('Comments', () => {
  beforeEach(() => {
    //client = sinon.createStubInstance(Octokit, {what: 2})
    builds = sinon.createStubInstance(Builds, {
      getBuilds: BUILDS,
    })
    comments = new Comments(client, 'owner', 'repo', builds)
  })
  
  describe('renderComment', () => {
    it('should fail with no builds', async () => {
      builds.getBuilds.returns([])
      try {
        await comments.renderComment('PR')
      } catch(err) {
        expect(err.message).to.eq('No builds exist for this PR')
      }
    })

    it('should render correctly', async () => {
      let body = await comments.renderComment('PR')
      expect(body).to.eq(COMMENT)
    })
  })
})
