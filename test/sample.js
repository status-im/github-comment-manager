const PKG_URLS = [
  'https://example.org/StatusIm-123-456-abc-pr.apk',
  'https://example.org/StatusIm-123-456-abc-pr.exe',
  null,
  'https://example.org/StatusIm-123-456-abc-pr.AppImage',
  'https://i.diawi.com/ABCDxyz1',
  'https://unknown.example.org/path/package',
  null,
  'https://example.org/StatusIm-123-456-abc-pr.tar.gz',
]

/* example valid build */
const BUILD = {
  id: 'ID-1',
  commit: 'abcd1234',
  success: true,
  platform: 'PLATFORM-1',
  duration: 'DURATION-1',
  url: 'https://example.com/some/url/path/',
  pkg_url: 'https://example.com/some/pkg/StatusIm-123-456-789.apk',
}

const archs = [ 'i386', 'x86_64', 'aarch64', 'arm64' ]
const platforms = [ 'linux', 'macos', 'windows', 'android', 'ios' ]

const getBuild = (idx) => ({
  id: `ID-${idx}`,
  commit: `COMMIT-${Math.floor(idx/4)}`,
  success: (idx%3) ? true : false,
  platform: platforms[idx%platforms.length],
  arch: archs[idx%archs.length],
  duration: `DURATION-${idx} 12 sec`,
  url: `URL-${idx}/`,
  pkg_url: PKG_URLS[(idx-1)%PKG_URLS.length],
  meta: { created: 1545294300000+(idx*56789) },
})

const BUILDS = Array.apply(null, Array(12)).map((v,i)=>getBuild(i+1))

const COMMENTS = [
  { pr: 'PR-1', comment_id: 1234 },
  { pr: 'PR-2', comment_id: 4321 },
  { pr: 'PR-3', comment_id: 9753 },
]

module.exports = { BUILD, BUILDS, COMMENTS }
