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
    path: '/builds/:repo/:pr',
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
  router.post('/builds/:repo/:pr/refresh', async (ctx) => {
    await ghc.safeUpdate(ctx.params)
    ctx.status = 201
    ctx.body = {status:'ok'}
  })

  /* list builds for repo+pr */
  router.get('/builds/:repo/:pr', async (ctx) => {
    const builds = await ghc.db.getBuilds(ctx.params)
    ctx.body = {count: builds.length, builds}
  })

  /* drop builds for repo+pr */
  router.delete('/builds/:repo/:pr', async (ctx) => {
    const rval = await ghc.db.removeBuilds(ctx.params)
    ctx.body = {}
  })

  /* list all managed comments */
  router.get('/comments', async (ctx) => {
    const comments = await ghc.db.getComments()
    ctx.body = {count: comments.length, comments}
  })

  return app
}

export default App
