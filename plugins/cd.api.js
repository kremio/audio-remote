const { fork, exec } = require('child_process')
const flagFileDirectory = '/tmp'
const flagFileName = 'audio-cd-in-drive'

module.exports = function(api){

  let cdWatcher

  api.register('api.ready', async () => {
    cdWatcher = fork('./cd-watcher',[flagFileDirectory, flagFileName])
    cdWatcher.on('message', (msg) => {
      if( cdAvailable != msg.cdAvailable ){
        cdAvailable =  msg.cdAvailable
        api.emit('cd.status.changed', [cdAvailable])
      }
    })

    cdWatcher.send('status')
  })


  function exitCdWatcher(code){
    console.log("Cleanin up")
    cdWatcher.kill('SIGHUP')
  }

  process.on('SIGINT', exitCdWatcher )
  process.on('exit', exitCdWatcher )


  let cdAvailable = false
  let tracksDurations = []


  api.register('cd.status.get', async () => {
    return {available: cdAvailable ? true : false}
  })

  api.register('cd.eject', async () => {
    exec("eject")
  })
}
