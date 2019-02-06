const log = require('loglevel')
const Koa = require('koa')
const JSON = require('koa-json')
const Logger = require('koa-logger')
const JsonError = require('koa-json-error')
const JoiRouter = require('koa-joi-router')
const BodyParser = require('koa-bodyparser')

const App = ({ghc, schema}) => {
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

  /* TEMPORARY fix to keep backwards compatibility */
  router.route({
    method: 'post',
    path: '/builds/:pr',
    validate: {
      type: 'json',
      body: schema,
    },
    handler: async (ctx) => {
      await ghc.db.addBuild({
        repo: 'status-react', 
        pr: ctx.params.pr,
        build: ctx.request.body,
      })
      await ghc.update({
        repo: 'status-react',
        pr: ctx.params.pr,
      })
      ctx.status = 201
      ctx.body = {status:'ok'}
    }
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
      await ghc.update(ctx.params)
      ctx.status = 201
      ctx.body = {status:'ok'}
    }
  })
  
  /* just re-render the comment */
  router.post('/builds/:repo/:pr/refresh', async (ctx) => {
    await ghc.update(ctx.params)
    ctx.status = 201
    ctx.body = {status:'ok'}
  })

  /* list builds for repo+pr */
  router.get('/builds/:repo/:pr', async (ctx) => {
    const builds = await ghc.db.getBuilds(ctx.params)
    ctx.body = {count: builds.length, builds}
  })

  /* list all managed comments */
  router.get('/comments', async (ctx) => {
    const comments = await ghc.db.getComments()
    ctx.body = {count: comments.length, comments}
  })

  return app
}

module.exports = App
