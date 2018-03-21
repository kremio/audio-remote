const Koa = require('koa')
const koaLog = require('koa-log')
const serve = require('koa-static')
const koaBody = require('koa-body')
const path = require('path')

const api = require('./api').default
const apiCd = require('./api/cd')

const guiDir ='/gui/dist'

//Setup some useful middlewares
const app = new Koa()
app.use(koaLog())
app.use(koaBody())

app.use(serve( __dirname + guiDir ))

//API calls handling middleware
app.use( api)

// this last middleware catches any request that isn't handled by
// koa-static or koa-router, ie your index.html in your example
/*
app.use(function* index() {
  yield send( this, path.resolve(guiDir, 'index.html') )
})
*/

/*
app.use(async ctx => {
  ctx.body = root;
})
*/
app.listen(3000)
