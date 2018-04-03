const utils = require('./utils')
const artistFactory = require('./artist')

function build(){
  return {
    title: `${utils.name()} ${utils.name()}`,
    date: utils.date(),
    duration: utils.duration()
  }
}

async function create(db){
  const data = build()
  data.id = await db.insertRecording( data )
  return data
}

async function createWithArtists(db, artists = 3){
  if( !isNaN( artists ) ){
    artists = await Promise.all([...Array(artists)].map(() => artistFactory.create(db) ))
  }
  const recording = await create(db)
  return await db.addRecordingArtists(recording, artists)
}


module.exports = {
  create,
  build,
  createWithArtists
}
