import log from 'loglevel'
import Koa from 'koa'
import JSON from 'koa-json'
import Logger from 'koa-logger'
import JsonError from 'koa-json-error'
import JoiRouter from 'koa-joi-router'
import BodyParser from 'koa-bodyparser'

const App = ({ghc, schema}) => {
  const app = new Koa()
  const router = new JoiRouter()

  app.on('error', (err, ctx) => {
    /* istanbul ignore next */
    console.error('server error', err, ctx)
  })

  app.use(Logger((str, args) => log.info(str)))
     .use(JSON({pretty: true}))
     .use(JsonError())
     .use(router.middleware())
     .use(BodyParser({onerror:console.error}))

  router.get('/', async (ctx) => {
    ctx.redirect('https://status.im/')
  })

  router.get('/health', async (ctx) => {
    ctx.body = 'OK'
  })

  /* store build and post/update the comment */
  router.route({
    method: 'post',
    path: '/builds/:org/:repo/:pr',
    validate: {
      type: 'json',
      body: schema,
    },
    handler: async (ctx) => {
      await ghc.db.addBuild({
        ...ctx.params, build: ctx.request.body
      })
      await ghc.safeUpdate(ctx.params)
      ctx.status = 201
      ctx.body = {status:'ok'}
    }
  })

  /* just re-render the comment */
  router.post('/builds/:org/:repo/:pr/refresh', async (ctx) => {
    await ghc.safeUpdate(ctx.params)
    ctx.status = 201
    ctx.body = {status:'ok'}
  })

  /* list builds for repo+pr */
  router.get('/builds/:org/:repo/:pr', async (ctx) => {
    const builds = await ghc.db.getPRBuilds(ctx.params)
    ctx.body = {count: builds.length, builds}
  })

  /* drop builds for repo+pr */
  router.delete('/builds/:org/:repo/:pr', async (ctx) => {
    const builds = await ghc.db.removeBuilds(ctx.params)
    ctx.body = {count: builds.length, builds}
  })

  /* list all builds */
  router.get('/builds', async (ctx) => {
    const builds = await ghc.db.getBuilds(ctx.params)
    const keys = Object.keys(builds)
    ctx.body = {count: keys.length, builds: keys}
  })

  /* list all managed comments */
  router.get('/comments', async (ctx) => {
    const comments = await ghc.db.getComments()
    ctx.body = {count: Object.keys(comments).length, comments}
  })

  return app
}

export default App
