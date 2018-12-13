import Koa from 'koa'
import JSON from 'koa-json'
import JsonError from 'koa-json-error'
import JoiRouter from 'koa-joi-router'
import BodyParser from 'koa-bodyparser'

const App = (ghc) => {
  const app = new Koa()
  const router = new JoiRouter()

  app.use(JSON({pretty: true}))
     .use(JsonError())
     .use(router.middleware())
     .use(BodyParser({onerror:console.error}))
     
  app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
  })
  
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
      /* TODO add validation of received JSON body */
      await ghc.db.addBuild(ctx.params.pr, ctx.request.body)
      await ghc.update(ctx.params.pr)
      ctx.body = {status:'ok'}
    }
  })
  
  router.post('/builds/:pr/refresh', async (ctx) => {
    /* just re-render the comment */
    await ghc.update(ctx.params.pr)
    ctx.status = 201
  })

  router.get('/builds/:pr', async (ctx) => {
    /* TODO add validation of id parameter */
    const builds = await ghc.db.getBuilds(ctx.params.pr)
    ctx.body = {count: builds.length, builds}
  })

  return app
}

module.exports = App
