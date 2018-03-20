const fs = require('fs')

const { fork } = require('child_process')
var MPlayer = require('mplayer')

const cdWatcher = fork('./cd-watcher')
const player = new MPlayer()
const cdPlayList = '/tmp/cd_playlist.m3u'

cdWatcher.on('message', (msg) => {
  console.log(msg)
  //Delete the playlist if the cd is ejected
  if( !msg.cdAvailable || fs.existsSync(`/tmp/${cdPlayList}`) ){
    if( !msg.cdAvailable ){
      fs.unlink(cdPlayList, (err) => {
        if(err){
          console.log(err)
        }
      })
    }
    return
  }

  //Create a playlist
  const tracksList = []
  for(let i = 1; i <= msg.cdAvailable; i++){
    tracksList.push(`cdda://${i}`)
  }
  const data = tracksList.join("\n")
  fs.writeFile(cdPlayList, data, (err) => {
    if(err){
      console.log(err)
      return
    }
    //play it
    player.openPlaylist(cdPlayList)
    player.play()
  })

})

function exitCdWatcher(code){
  console.log("Cleanin up")
  cdWatcher.kill('SIGHUP')
}

process.on('SIGINT', exitCdWatcher )
process.on('exit', exitCdWatcher )
