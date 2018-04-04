const api = require('./index.js')
const Musicbrainz = require('../musicbrainz').default

const musicbrainz = new Musicbrainz()

api.register('cd.toc.ready', async (...TOC) => {
  try{
    const discid =  musicbrainz.computeDiscId( TOC )
    const cdData = await musicbrainz.fetchCdData( discid )
    const tracksInfo = cdData.tracks
    delete cdData.tracks
    api.emit('cd.trackslist.update', [cdData, tracksInfo])
  }catch(err){
    console.log("Musicbrains error:", err)
    api.emit('cd.trackslist.notfound')
  }
})

api.register('cd.recording.set', async (recordingId) => {
  try{
    const cdData = await musicbrainz.fetchReleaseData( recordingId )
    const tracksInfo = cdData.tracks
    delete cdData.tracks
    api.emit('cd.trackslist.update', [cdData, tracksInfo])
  }catch(err){
    console.log("Musicbrains error:", err)
    api.emit('cd.trackslist.notfound')
  }
})

api.register('search.cd', async (title, artist) => {
  const tracksCount = api.emit('cd.trackslist.count.get')
  return await musicbrainz.findRecordingByName( title, artist, tracksCount )
})

