import log from 'loglevel'
import Koa from 'koa'
import JSON from 'koa-json'
import Logger from 'koa-logger'
import JsonError from 'koa-json-error'
import JoiRouter from 'koa-joi-router'
import BodyParser from 'koa-bodyparser'

const App = (ghc) => {
  const app = new Koa()
  const router = new JoiRouter()

  app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
  })

  app.use(Logger((str, args) => log.info(str)))
     .use(JSON({pretty: true}))
     .use(JsonError())
     .use(router.middleware())
     .use(BodyParser({onerror:console.error}))

  router.get('/health', async (ctx) => {
    ctx.body = 'OK'
  })

  router.route({
    method: 'post',
    path: '/builds/:pr',
    validate: {
      type: 'json',
      body: ghc.db.schema,
    },
    handler: async (ctx) => {
      /* save the build */
      await ghc.db.addBuild(ctx.params.pr, ctx.request.body)
      /* post or update the comment */
      await ghc.update(ctx.params.pr)
      ctx.status = 201
      ctx.body = {status:'ok'}
    }
  })
  
  router.post('/builds/:pr/refresh', async (ctx) => {
    /* just re-render the comment */
    await ghc.update(ctx.params.pr)
    ctx.status = 201
    ctx.body = {status:'ok'}
  })

  router.get('/builds/:pr', async (ctx) => {
    const builds = await ghc.db.getBuilds(ctx.params.pr)
    ctx.body = {count: builds.length, builds}
  })

  router.get('/comments', async (ctx) => {
    const comments = await ghc.db.getComments()
    ctx.body = {count: comments.length, comments}
  })

  return app
}

module.exports = App
