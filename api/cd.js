const api = require('./index.js')
const { fork, exec } = require('child_process')

const cdWatcher = fork('./cd-watcher')

function exitCdWatcher(code){
  console.log("Cleanin up")
  cdWatcher.kill('SIGHUP')
}

process.on('SIGINT', exitCdWatcher )
process.on('exit', exitCdWatcher )


let cdAvailable = false
let tracksDurations = []

cdWatcher.on('message', (msg) => {
  console.log(msg)
  if( cdAvailable != msg.cdAvailable ){
    cdAvailable =  msg.cdAvailable
    api.emit('cd.status.changed', [cdAvailable])
  }
})

cdWatcher.send('status')

api.register('cd.status.get', async () => {
  return {available: cdAvailable ? true : false}
})

api.register('cd.eject', async () => {
  exec("eject")
})
