const api = require('./index.js')
const Musicbrainz = require('../musicbrainz').default

const musicbrainz = new Musicbrainz()

api.register('cd.toc.ready', async (...TOC) => {
  try{
    const cdData = await musicbrainz.fetchCdData( TOC )
    const tracksInfo = cdData.tracks
    delete cdData.tracks
    api.emit('cd.trackslist.update', [cdData, tracksInfo])
  }catch(err){
    console.log("Musicbrains error:", err)
    api.emit('cd.trackslist.notfound')
  }
})
