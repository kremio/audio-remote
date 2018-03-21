const Koa = require('koa')
const koaLog = require('koa-log')
const serve = require('koa-static')
const koaBody = require('koa-body')
const path = require('path')

const api = require('./api').default

//TODO: Figure out a better way to register API modules
const apiCd = require('./api/cd')
const apiPlayer = require('./api/player')

const guiDir ='/gui/dist'

//Setup some useful middlewares
const app = new Koa()
app.use(koaLog())
app.use(koaBody())

//Serve static files
app.use(serve( __dirname + guiDir ))

//API calls handling middleware
app.use( api)

app.listen(3000)
