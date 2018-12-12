import Koa from 'koa'
import Router from 'koa-router'
import JSON from 'koa-json'
import BodyParser from 'koa-bodyparser'

const App = (ghc) => {
  const app = new Koa()
  const router = new Router()
  
  app.use(router.routes())
     .use(router.allowedMethods())
     .use(JSON({pretty: true}))
     .use(BodyParser())

  app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
  })
  
  router.get('/health', async (ctx) => {
    ctx.body = 'OK'
  })

  router.put('/builds/:pr', async (ctx) => {
    /* TODO add validation of received JSON body */
    console.log(ctx.request.body)
    await ghc.db.addBuild(ctx.params.pr, ctx.request.body)
    await ghc.update(ctx.params.pr)
    ctx.body = {status:'ok'}
  })
  
  router.get('/builds/:pr', async (ctx) => {
    /* TODO add validation of id parameter */
    const builds = await ghc.db.getBuilds(ctx.params.pr)
    ctx.body = {status:'ok', builds}
  })

  router.get('/test', async (ctx) => {
    ctx.body = {
      status: 'OK',
      response: await ghc.firstComment(7056),
    }
  })

  return app
}

module.exports = App
