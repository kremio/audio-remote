const api = require('./index.js')
const { fork, exec } = require('child_process')
const cdWatcher = fork('./cd-watcher')

let cdAvailable = false

cdWatcher.on('message', (msg) => {
  console.log(msg)
  if( cdAvailable != msg.cdAvailable ){
    cdAvailable =  msg.cdAvailable
    api.emit('cd.status.changed', cdAvailable)
  }
})

cdWatcher.send('status')

api.register('cd.status.get', () => {
  return {available: cdAvailable ? true : false}
})

api.register('cd.eject', () => {
  exec("eject")
})
