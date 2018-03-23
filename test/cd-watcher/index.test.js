const { fork } = require('child_process')
const fs = require('fs')


describe('Monitoring audio cd presence in drive', () => {
  let watcher
  const flagFileDirectory = '/tmp'
  const flagFileName = 'test-flag-file'
  const flagFilePath = `${flagFileDirectory}/${flagFileName}`
  const trackCount = 42
  
  beforeEach((done) => {
    //console.log("Started cd-watcher process with PID", watcher.pid)
    fs.unlink(flagFilePath, (err) => {
      if (err && err.code != 'ENOENT'){
        throw err
      }
      watcher = fork('./cd-watcher',[flagFileDirectory, flagFileName])
      done()
    })
  })

  afterEach((done) => {
    watcher.kill('SIGHUP')
    fs.unlink(`${flagFileDirectory}/${flagFileName}`, (err) => {
      if (err && err.code != 'ENOENT'){
        throw err
      }
      done()
    })
  })

  test('Report status based on the presence of the flag file', (done) => {

    function noCd(msg){
      expect(msg.cdAvailable).toBe(false)
      currentAssertion = cdInserted
      fs.writeFile(flagFilePath, trackCount)
    }

    function cdInserted(msg){
      expect(msg.cdAvailable).toEqual(trackCount)
      currentAssertion = cdRemoved
      fs.unlinkSync(flagFilePath)
    }

    function cdRemoved(msg){
      expect(msg.cdAvailable).toBe(false)
      done()
    }

    let currentAssertion = noCd

    watcher.on('message', (msg) => {
      currentAssertion(msg)
    })

    watcher.send('status')
  })
})
