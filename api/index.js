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

function emit(msg, params = []){

  console.log("emit", msg, params)

  const leaf = getLeaf( msg.split(".") )
  if( leaf.handlers.length == 0 ){
    return {}
  }
  return leaf.handlers.reduce(
    (acc, handler) => Object.assign(acc, handler( ...params )),
    {}
  )
}

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

  const result = emit( q[1], q[2] ? q[2].split(',') : undefined )

  ctx.response.status = 200
  ctx.response.body = result
}
