const api = require('./index.js')
const Musicbrainz = require('../musicbrainz').default

const musicbrainz = new Musicbrainz()

api.register('cd.toc.ready', async (...TOC) => {
  const cdData = await musicbrainz.fetchCdData( TOC )
//  console.log("Answer from musicbrainz:", cdData)
  const albumInfo = {
    title: cdData.title,
    date: cdData.date
  }
  const tracksInfo = cdData.tracks
  api.emit('cd.trackslist.update', [albumInfo, tracksInfo])
})
