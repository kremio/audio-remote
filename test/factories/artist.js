const utils = require('./utils')

function build(){
  return {
    name: `${utils.name()} ${utils.name()}`
  }
}

async function create( db ){
  const data = build()
  data.id = await db.insertArtist( data )
  return data
}

module.exports = {
  build,
  create
}
