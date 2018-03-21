const api = require('./index.js')
const { fork, exec } = require('child_process')
const fs = require('fs')
const MPlayer = require('mplayer')

class Player extends MPlayer{
  constructor(){
    super()
    this.cdPlayList = '/tmp/cd_playlist.m3u'
    this.isPlaying = false
    this.isPlayingCD = false
    this.currentFile = undefined
    this._volume = 100 //initial volume, in percent

    this.on('stop', () => {
      this.isPlaying = false
      this.isPlayingCD = false
      console.log(this.isPlaying)
    })

    this.on('start', () => {
      this.isPlaying = true
      console.log(this.isPlaying)
    })

    this.on('status', (status) => {
      this.currentFile = status.filename
      this._volume = status.volume
    })

    //Set initial volume
    this.volume( this._volume )
  }

  playCD(trackCount){
    if(this.isPlayingCD){
      return //already playing the CD
    }

    if(this.isPlaying){
      this.stop()
    }

    //Create a playlist
    const tracksList = []
    for(let i = 1; i <= trackCount; i++){
      tracksList.push(`cdda://${i}`)
    }
    const data = tracksList.join("\n")
    fs.writeFile(this.cdPlayList, data, (err) => {
      if(err){
        console.log(err)
        return
      }
      //play it
      this.openPlaylist(this.cdPlayList)
      this.play()
      this.isPlayingCD = trackCount
    })

    
  }

}

const player = new Player()


api.register('cd.status.changed', (trackCount) => {
  if(trackCount){
    player.playCD(trackCount)
  }
})

api.register('player.status.get', () => {
  return {
    playing: player.isPlaying,
    playingCd: player.isPlayingCD,
    playingFile: player.currentFile
  }
})

api.register('player.play.toggle', () => {
  player.isPlaying ? player.pause() : player.play()
  return { before: player.isPlaying }
})

api.register('player.playlist.previous', () => {
  player.previous()
  return { }
})

api.register('player.playlist.next', () => {
  player.next()
  return { }
})

api.register('volume.set', (volumePercent) => {
  console.log("Set volume", volumePercent)
  //Cap it
  const volume = Math.min( 150, Math.max(0, Number(volumePercent)) )
  player.volume( volume )
  return {volume}
})

api.register('volume.get', () => {
  return {volume: this.player._volume}
})
