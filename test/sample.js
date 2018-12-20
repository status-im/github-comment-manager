/* example valid build */
const BUILD = {
  id: 'ID-1',
  commit: 'abcd1234',
  success: true,
  platform: 'PLATFORM-1',
  duration: 'DURATION-1',
  url: 'https://example.com/some/url/path',
  pkg_url: 'https://example.com/some/pkg/path',
}

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

const COMMENTS = [
  { pr: 'PR-1', comment_id: 1234 },
  { pr: 'PR-2', comment_id: 4321 },
  { pr: 'PR-3', comment_id: 9753 },
]

module.exports = { BUILD, BUILDS, COMMENTS }
