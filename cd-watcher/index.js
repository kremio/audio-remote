const fs = require('fs')

//Watch the insertion/ejection of audio cd, must be run as a Node child process
const flagFile = 'audio-cd-in-drive' 

const myProcess = process

function readFlagFile(){
	let cdInserted = fs.existsSync(`/tmp/${flagFile}`)
	if( cdInserted ){
		cdInserted = Number( fs.readFileSync(`/tmp/${flagFile}`,{encoding:'utf-8'}) )
	}
	myProcess.send({cdAvailable: cdInserted})
}

// Check and report current state
myProcess.on('message', (msg) => {
	if( msg != 'status' ){
		return;
	}
	readFlagFile()
})

// Watch the /tmp folder for changes to the audio-cd-in-drive file
const watcher = fs.watch('/tmp',(eventType, fileName) => {
	if( !fileName || fileName != flagFile ){
		return
	}
	readFlagFile()
})

watcher.on('error', (err) => console.log("AudioCD watcher error;", err ) )
//Don't forget to kill from the parent or their will be process hanging and channel errors
