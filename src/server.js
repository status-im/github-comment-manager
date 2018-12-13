import Logger from 'koa-logger'

import App from './app'
import Octokit from '@octokit/rest'
import Builds from './builds'
import Comments from './comments'

/* DEFAULTS */
const LISTEN_PORT      = process.env.LISTEN_PORT      || 8000
const GH_TOKEN         = process.env.GH_TOKEN         || null
const GH_REPO_OWNER    = process.env.GH_REPO_OWNER    || 'status-im'
const GH_REPO_NAME     = process.env.GH_REPO_NAME     || 'status-react'
const DB_PATH          = process.env.DB_PATH          || '/tmp/builds.db'
const DB_SAVE_INTERVAL = process.env.DB_SAVE_INTERVAL || 5000

/* to store current builds bound to a PR */
const builds = new Builds(DB_PATH, DB_SAVE_INTERVAL)

/* necessary to post and update comments */
const gh = new Octokit()
gh.authenticate({type: 'token', token: GH_TOKEN})

const ghc = new Comments(gh, GH_REPO_OWNER, GH_REPO_NAME, builds)
const app = App(ghc, builds)

app.use(Logger())

app.listen(LISTEN_PORT)

console.log(`Started at: http://localhost:${LISTEN_PORT}/`)
