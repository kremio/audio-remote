const listeners = {}

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

function emit(msg, params){
  const leaf = getLeaf( msg.split(".") )
  if( leaf.handlers.length == 0 ){
    return {}
  }
  return leaf.handlers.reduce(
    (acc, handler) => Object.assign(acc, handler(params)),
    {}
  )
}

exports.emit = emit
exports.register = register

exports.default = async (ctx) => {
  console.log( ctx.request.path )
  if( ctx.request.path != "/api" ){
    return
  }

  if (!ctx.is('text/*')) {
    ctx.throw(415, 'Plain text only!')
  }

  const result = emit( JSON.parse(ctx.request.body).what )
  console.log("Result", result)
  ctx.response.status = 200
  ctx.response.body = result

  //  console.log(JSON.parse(ctx.request.body).what)
}
