import log from 'loglevel'
import Logger from 'koa-logger'
import { Octokit } from '@octokit/rest'

import App from './app.js'
import Builds from './builds.js'
import Comments from './comments.js'
import schema from './schema.js'

/* DEFAULTS */
const LOG_LEVEL        = process.env.LOG_LEVEL        || 'INFO'
const LISTEN_PORT      = process.env.LISTEN_PORT      || 8000
const GH_TOKEN         = process.env.GH_TOKEN         || null
const GH_REPO_OWNER    = process.env.GH_REPO_OWNER    || 'status-im'
const GH_REPO_NAMES    = process.env.GH_REPO_NAMES    || ''
const DB_PATH          = process.env.DB_PATH          || '/tmp/builds.db'
const DB_SAVE_INTERVAL = process.env.DB_SAVE_INTERVAL || 5000

/* set the logging level (TRACE, DEBUG, INFO, WARN, ERROR, SILENT) */
console.dir(log)
log.setDefaultLevel(log.levels[LOG_LEVEL])

/* to store current builds bound to a PR */
const builds = new Builds(DB_PATH, DB_SAVE_INTERVAL)

/* necessary to post and update comments */
const gh = new Octokit({auth: `token ${GH_TOKEN}`})

const ghc = new Comments({
  client: gh,
  owner: GH_REPO_OWNER,
  repos: GH_REPO_NAMES.split(','),
  builds: builds,
})
const app = App({ghc, schema})

app.use(Logger())

app.listen(LISTEN_PORT)

console.log(`Started at: http://localhost:${LISTEN_PORT}/`)
