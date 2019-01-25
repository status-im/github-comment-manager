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

const getBuild = (idx) => ({
  id: `ID-${idx}`,
  commit: `COMMIT-${Math.floor(idx/4)}`,
  success: (idx%3) ? true : false,
  platform: `PLATFORM-${idx}`,
  duration: `DURATION-${idx} 12 sec`,
  url: `URL-${idx}`,
  pkg_url: `PKG_URL-${idx}`,
  meta: { created: 1545294300000+(idx*56789) },
})

const BUILDS = Array.apply(null, Array(12)).map((v,i)=>getBuild(i+1))

const COMMENTS = [
  { pr: 'PR-1', comment_id: 1234 },
  { pr: 'PR-2', comment_id: 4321 },
  { pr: 'PR-3', comment_id: 9753 },
]

module.exports = { BUILD, BUILDS, COMMENTS }
