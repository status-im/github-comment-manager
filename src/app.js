import Koa from 'koa'
import Router from 'koa-router'
import JSON from 'koa-json'
import BodyParser from 'koa-bodyparser'

const App = (ghc) => {
  const app = new Koa()
  const router = new Router()

  app.use(BodyParser({onerror:console.error}))
     .use(router.routes())
     .use(router.allowedMethods())
     .use(JSON({pretty: true}))

  app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
  })
  
  router.get('/health', async (ctx) => {
    ctx.body = 'OK'
  })

  router.post('/builds/:pr', async (ctx) => {
    /* TODO add validation of received JSON body */
    await ghc.db.addBuild(ctx.params.pr, ctx.request.body)
    await ghc.update(ctx.params.pr)
    ctx.body = {status:'ok'}
  })
  
  router.get('/builds/:pr', async (ctx) => {
    /* TODO add validation of id parameter */
    const builds = await ghc.db.getBuilds(ctx.params.pr)
    ctx.body = {status:'ok', builds}
  })

  return app
}

module.exports = App
