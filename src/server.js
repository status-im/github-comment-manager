import Logger from 'koa-logger'

import App from './app'
import Octokit from '@octokit/rest'
import GhComments from './gh_comments'

/* DEFAULTS */
const LISTEN_PORT = process.env.LISTEN_PORT || 3000

const gh = Octokit()
const ghc = new GhComments(gh)
const app = App(ghc)

app.use(Logger())

app.listen(LISTEN_PORT)

console.log(`Started at: http://localhost:${LISTEN_PORT}/`)
