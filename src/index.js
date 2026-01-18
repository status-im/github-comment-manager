import log from 'loglevel'
import Logger from 'koa-logger'
import { Octokit } from '@octokit/rest'

import App from './app.js'
import DB from './db.js'
import Comments from './comments.js'
import schema from './schema.js'

/* DEFAULTS */
const LOG_LEVEL    = process.env.LOG_LEVEL    || 'INFO'
const LISTEN_PORT  = process.env.LISTEN_PORT  || 8000
const GH_TOKEN     = process.env.GH_TOKEN     || null
const GH_WHITELIST = process.env.GH_WHITELIST || ''
const DB_PATH      = process.env.DB_PATH      || '/tmp/builds.db'

/* set the logging level (TRACE, DEBUG, INFO, WARN, ERROR, SILENT) */
log.setDefaultLevel(log.levels[LOG_LEVEL])

/* LevelDB for builds and comments. */
const db = new DB(DB_PATH)

/* necessary to post and update comments */
const gh = new Octokit({auth: `token ${GH_TOKEN}`})

/* check if GitHub connection works */
const { data } = await gh.request("/user")
console.log(`GitHub Login: ${data.login}`)

const ghc = new Comments({
  client: gh, db: db, whitelist: GH_WHITELIST.split(','),
})
const app = App({ghc, schema})

app.use(Logger())

app.listen(LISTEN_PORT)

console.log(`Started at: http://localhost:${LISTEN_PORT}/`)
