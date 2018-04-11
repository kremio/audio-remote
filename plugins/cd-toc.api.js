const util = require('util')
const exec = util.promisify(require('child_process').exec)

let tracksList = undefined

module.exports = function(api){

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
    const durationsSeconds = (blocksCount / 75.0).toFixed(2)
    durations.push(durationsSeconds)

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
    api.emit('cd.toc.ready', ...TOC)

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
    //console.log("New tracks list:", tracksList)
  })

  api.register('cd.trackslist.track.duration', (trackFile) => {
    //console.log('cd.trackslist.track.duration', trackFile)
    if( !tracksList ){
      return -1
    }
    //console.log( tracksList )
    return tracksList.tracks
      .find( (track ) => track.file == trackFile )
      .duration
  })

  api.register('cd.trackslist.update', async (albumInfo, tracksInfo) => {
    //console.log("Received new CD info:", albumInfo, tracksInfo)
    const tracks = tracksInfo ? tracksInfo.map( (track) => {
      return Object.assign({}, tracksList && tracksList.tracks && tracksList.tracks[track.position-1], track)
    }) : (tracksList && tracksList.tracks) || []

    tracksList = Object.assign({}, tracksList, albumInfo,{tracks})
    delete tracksList.temporary
    delete tracksList.notfound
  })

  api.register('cd.trackslist.notfound', async () => {
    delete tracksList.temporary
    tracksList.notfound = true
  })

  api.register('cd.recording.set', async () => {
    tracksList.temporary = true
  })

  api.register('cd.trackslist.get', async () => {
    return tracksList
  })

  api.register('cd.trackslist.count.get', () => {
    return tracksList.tracks.length
  })
}
