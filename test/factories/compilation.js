const utils = require('./utils')
const recordingFactory = require('./recording')

function build(){
  return Object.assign({
    mbid: null,
    cover: null
  },{
    title: `${utils.name()} ${utils.name()}`,
    date: utils.date()
  })
}

async function create( db ){
  const data = build()
  data.id = await db.insertCompilation( data )
  return data
}

async function createWithRecordings(db, recordings = 10){
  if( !isNaN( recordings ) ){
    recordings = await Promise.all([...Array(recordings)].map(() => recordingFactory.create(db) ))
  }
  const compilation = await create(db)
  return await db.addCompilationRecordings(compilation, recordings)
}


module.exports = {
  build,
  create,
  createWithRecordings
}
