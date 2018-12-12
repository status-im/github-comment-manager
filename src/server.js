import Logger from 'koa-logger'

import App from './app'
import Loki from 'lokijs'
import Octokit from '@octokit/rest'
import Builds from './builds'
import Comments from './comments'

/* DEFAULTS */
const LISTEN_PORT = process.env.LISTEN_PORT || 3000
const GH_TOKEN = process.env.GH_TOKEN || null
const GH_REPO_OWNER = 'status-im'
const GH_REPO_NAME = 'status-react'
const DB_PATH = '/tmp/db.json'

/* to store current builds bound to a PR */
const db = new Loki(DB_PATH, {autosave:true})
/* necessary to post and update comments */
const gh = new Octokit()
gh.authenticate({type: 'token', token: GH_TOKEN})

const builds = new Builds(db)
const ghc = new Comments(gh, GH_REPO_OWNER, GH_REPO_NAME, builds)
const app = App(ghc, builds)

app.use(Logger())

app.listen(LISTEN_PORT)

console.log(`Started at: http://localhost:${LISTEN_PORT}/`)
