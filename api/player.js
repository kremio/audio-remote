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
    this.tracksList = []
    this._volume = 100 //initial volume, in percent

    this.on('stop', () => {
      this.isPlaying = false
      //this.isPlayingCD = false
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
    this.tracksList = []
    for(let i = 1; i <= trackCount; i++){
      this.tracksList.push(`cdda://${i}`)
    }
    const data = this.tracksList.join("\n")
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

  jumpTo(position){
    if( !this.isPlayingCD || position < 1 || position > this.tracksList.length ){
      return
    }

    const current = this.tracksList.findIndex( (track) => track == this.currentFile ) + 1
    if( current == position ){
      return
    }

    this.openFile(this.tracksList[position - 1])
    /*
    const action = current > position ? this.previous.bind(this) : this.next.bind(this)
    for(let i = 0; i < Math.abs(current - position); i++){
      action()
    }*/
//    console.log("jumpTo", this.currentFile, this.tracksList )
  }

}

const player = new Player()


api.register('cd.status.changed', async (trackCount) => {
  if(trackCount){
    player.playCD(trackCount)
  }
})

api.register('player.status.get', async () => {
  return {
    playing: player.isPlaying,
    playingCd: player.isPlayingCD,
    playingFile: player.currentFile
  }
})

api.register('player.play.toggle', async () => {
  player.isPlaying ? player.pause() : player.play()
  return { before: player.isPlaying }
})

api.register('player.playlist.previous', async () => {
  player.previous()
  return { }
})

api.register('player.playlist.next', async () => {
  player.next()
  return { }
})

api.register('player.playlist.jumpTo', async (index) => {
  player.jumpTo(index)
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
