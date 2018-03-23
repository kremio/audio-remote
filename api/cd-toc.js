const api = require('./index.js')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

let tracksList = undefined

async function cdDiscId(){
  const { stdout, stderr } = await exec('cd-discid --musicbrainz')
  if( stderr ){
    throw new Error( stderr )
  }
  return stdout.replace("\n",'').split(" ").map( (str) => Number(str) )
}

function computeDurations(toc, durations = []){
  if(toc.length < 2){
    return durations
  }
  const from = toc.shift()
  let blocksCount = toc[0] - from
  //Each block correspond to 1/75 second of audio
  //they are 75 times 1/75 second in a second
  //they are 4500 times 1/75 second in a minute

  const minutes = Math.floor( blocksCount / 4500  )
  blocksCount -= minutes * 4500
  const seconds = Math.floor( blocksCount / 75 )
  blocksCount -= seconds * 75
  const centiseconds = (blocksCount / 75).toFixed(2)

  durations.push(`${minutes}:${seconds}${""+centiseconds.substring(1)}`)

  return computeDurations( toc, durations )
}

/*
 * Use the cd-discid program to
 * retrieve TOC data and use it to compute
 * the tracks length.
 */
async function readTOC(){
  const TOC = await cdDiscId()
  const trackCount = TOC.shift()
  //Broadcast the TOC
  api.emit('cd.toc.ready', TOC)

  //Create the default tracks list
  return computeDurations(TOC)
    .reduce( (acc, duration, trackNum) => {
      acc.tracks.push({
        title:`Track ${trackNum + 1}`,
        file:`cdda://${trackNum + 1}`,
        duration: duration
      })
      return acc
    }, {title: "unknown", temporary:true, tracks:[]} )
}

api.register('cd.status.changed', async (available) => {
  if(!available){
    tracksList = undefined
    return
  }

  if( tracksList ){ //prevents redoing computation
    return
  }

  tracksList = await readTOC()
  console.log("New tracks list:", tracksList)
})

api.register('cd.trackslist.update', async (albumInfo, tracksInfo) => {
  //console.log("Received new CD info:", albumInfo, tracksInfo)
  tracksInfo.forEach( (track) => {
    console.log("track", track)
    Object.assign(tracksList.tracks[track.position-1], track)
  })
  Object.assign(tracksList, albumInfo)
  delete tracksList.temporary
})

api.register('cd.trackslist.get', async () => {
  return tracksList
})
