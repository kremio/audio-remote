const {promisify} = require('util')
const fs = require('fs')
const path = require('path')

const lstatAsync = promisify(fs.lstat)
const readdirAsync = promisify(fs.readdir)

const pluginsDir = path.resolve(__dirname,'../plugins')



const listeners = {}

/*
 * Return the leaf corresponding to given path in the event tree.
 * Note: Not a pure function, it creates missing intermediary branches
 * and sets an empty handlers array on a newly created leaf
 */
function getLeaf(msgParts, tree = listeners){
  const branch = msgParts.shift()

  if( !tree[branch] ){
    tree[branch] = {}
  }

  if( msgParts.length == 0 ){
    const leaf = tree[branch]
    if( !leaf.handlers ){
      leaf.handlers = []
    }
    return leaf
  }

  return getLeaf(msgParts, tree[branch])
}


function register(msg, handler){
  const leaf = getLeaf( msg.split(".") )
  leaf.handlers.push(handler)
}

/*
 * Call each registered handlers for the given message
 * asynchronously.
 * Returns an array of promises.
 */
function emit(msg, params = undefined){

  console.log("emit", msg, params)

  const leaf = getLeaf( msg.split(".") )
  if( leaf.handlers.length == 0 ){
    return []
  }

  let iterable = true
  // checks for null and undefined
  if (!params || typeof params === 'string') {
    iterable = false
  }else{
    iterable = typeof params[Symbol.iterator] === 'function'
  }

  const arg = iterable ? params : [params]

  return leaf.handlers
    .map( (handler) => handler( ...arg  ) )
}



/*
 * Dynamically load the API modules
 * All the modules from files ending in '.api.js' in the
 * 'plugins' directory and below are loaded.
 */
async function ModuleLoader( inputPath ){
  const stat = await lstatAsync( inputPath )

  if (stat.isDirectory()) {
    // we have a directory: do a tree walk
    const files = await readdirAsync( inputPath )

    return Promise.all(
      files.map( (file) => path.join(inputPath, file) )
      .map( ModuleLoader )
    )
  }

    if( !inputPath.match(/\.api\.js$/) ){
      return
    }
    // we have a file: load it
    require( inputPath )({emit,register})
    console.log( `API module ${inputPath} loaded` )
    return
}

//Load all the modules and notify them that the API is ready
ModuleLoader( pluginsDir ).then( () => {
  emit('api.ready')
})



/*
 * Call emit('path.of.event', [eventsParams]) to
 * emit an API event.
 */
exports.emit = emit

/*
 * Call register('path.of.event', eventHandler) to
 * register an event listener
 */
exports.register = register

//Koa middleware to handle remote api requests
exports.default = async (ctx) => {
  console.log( ctx.request.path )
  if( ctx.request.path != "/api" ){
    return
  }

  if (!ctx.is('text/*')) {
    ctx.throw(415, 'Plain text only!')
  }

  //Parse the request into event path and event params
  const q = JSON.parse(ctx.request.body).what.match(/^([^(]*)\(?([^)]*)?/)

  //Wait for all the listeners to process the request
  //and gather all the results in a single plain object
  const result = await Promise.all(
    emit( q[1], q[2] ? q[2].split(',') : undefined )
  ).then( (results) => {
    return results
      .reduce( (acc, res ) => Object.assign(acc, res),{} )
  })

  ctx.response.status = 200
  ctx.response.body = result
}
