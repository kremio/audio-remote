const utils = require('./utils')
const compilationFactory = require('./compilation')

function build(){
  return {
    id: utils.discid()
  }
}


async function create( db ){
  const data = build()
  data.id = await db.insertCd( data )

  return data
}

async function createWithCompilation(db, compilation = undefined){
  if( !compilation ){
    compilation = await compilationFactory.create(db)
  }
  const cd = await create(db)
  cd.compilation = await db.setCdCompilation(cd, compilation)
  return cd
}

module.exports = {
  build,
  create,
  createWithCompilation
}
