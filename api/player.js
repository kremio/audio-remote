const api = require('./index.js')
const { fork, exec } = require('child_process')
const fs = require('fs')
const MPlayer = require('mplayer')

class Player extends MPlayer{
  constructor(){
    super()
    this.tmpPlayList = '/tmp/audio_remote_playlist.m3u'
    this.isPlaying = false
    this.currentFile = undefined
    this._volume = 100 //initial volume, in percent

    this.on('stop', () => {
      this.isPlaying = false
      console.log(this.isPlaying)
    })

    this.on('start', () => {
      this.isPlaying = true
      console.log(this.isPlaying)
    })

    this.on('status', (status) => {
      this.currentFile = status.filename
      api.emit('playlist.currentfile.set', [this.currentFile])
      this._volume = status.volume
    })

    //Set initial volume
    this.volume( this._volume )
  }

  playList( tracksList ){

    if(this.isPlaying){
      this.stop()
    }

    //Create a playlist file
    const data = tracksList.join("\n")
    fs.writeFile(this.tmpPlayList, data, (err) => {
      if(err){
        console.log(err)
        return
      }
      //play it
      this.openPlaylist(this.tmpPlayList)
    })
  }

  cdOut(){
    if(!this.isPlayingCD){
      return
    }
    this.stop()
    this.isPlayingCD = false
  }

}

const player = new Player()


api.register('cd.status.changed', async (trackCount) => {
  if(!trackCount){
    player.cdOut()
  }
})

api.register('player.play.list', async (files) => {
  player.playList( files )
})


api.register('player.status.get', async () => {
  return {
    playing: player.isPlaying,
    playingFile: player.currentFile
  }
})

api.register('player.play.toggle', async () => {
  player.isPlaying ? player.pause() : player.play()
  return { before: player.isPlaying }
})

api.register('playlist.previous', async () => {
  player.previous()
  return { }
})


api.register('playlist.next', async () => {
  player.next()
  return { }
})

api.register('volume.set', async (volumePercent) => {
  console.log("Set volume", volumePercent)
  //Cap it
  const volume = Math.min( 150, Math.max(0, Number(volumePercent)) )
  player.volume( volume )
  return {volume}
})

api.register('volume.get', async () => {
  return {volume: player._volume}
})
