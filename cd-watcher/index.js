const fs = require('fs')
const {promisify} = require('util')
const asyncStat = promisify(fs.stat)
//Watch the insertion/ejection of audio cd, must be run as a Node child process

const FLAG_FILE_DIR_ARG = 2
const FLAG_FILE_NAME_ARG = 3
const flagFileDirectory = process.argv[FLAG_FILE_DIR_ARG]
const flagFileName = process.argv[FLAG_FILE_NAME_ARG]

const flagFilePath = `${flagFileDirectory}/${flagFileName}`
const myProcess = process

let cdInserted = undefined

function readFlagFile(){
  asyncStat(flagFilePath).then((stats) => {
    let _cdInserted = false
    if( stats.isFile() && stats.size > 0 ){
      _cdInserted = Number( fs.readFileSync(flagFilePath ,{encoding:'utf-8'}) )
    }
    if( _cdInserted != cdInserted ){ //avoid triggering the same event twice
      cdInserted = _cdInserted
      myProcess.send({cdAvailable: cdInserted})
    }
  }).catch((err) => {
    if(err.code && err.code == 'ENOENT'){
      if(cdInserted != false){
        cdInserted = false
        myProcess.send({cdAvailable: cdInserted})
      }
      return
    }
    myProcess.send(err)
  })
}

// Check and report current state
myProcess.on('message', (msg) => {
  if( msg != 'status' ){
    return;
  }
  readFlagFile()
})

// Watch the /tmp folder for changes to the audio-cd-in-drive file
const watcher = fs.watch(flagFileDirectory,(eventType, fileName) => {
  if( !fileName || fileName != flagFileName ){
    return
  }
  readFlagFile()
})

watcher.on('error', (err) => console.log("AudioCD watcher error;", err ) )
//Don't forget to kill from the parent or their will be process hanging and channel errors
