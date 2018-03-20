const Koa = require('koa')
const koaLog = require('koa-log')
const serve = require('koa-static')
const send    = require('koa-send')
const app = new Koa()
const path = require('path')

const guiDir ='/gui/dist'

app.use(koaLog())

app.use(serve( __dirname + guiDir ))

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
