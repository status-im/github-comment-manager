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
     .use(bodyparser({detectJSON:(ctx) => /\.json$/i.test(ctx.path)}))

  app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
  })
  
  router.get('/health', async (ctx) => {
    ctx.body = 'OK'
  })

  router.put('/comment/:id', async (ctx) => {
    ghc.addComment(ctx.request.body)
    ctx.body = {status:'ok'}
  })
  
  return app
}

module.exports = App
