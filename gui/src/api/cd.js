import api from "./index.js"

function status(){
  return api.emit("cd.status.get")
}

function eject(){
  return api.emit("cd.eject")
}

function tracksList(){
  return api.emit("cd.trackslist.get")
}

function assignRecording(recordingId){
  return api.emit("cd.recording.set",[recordingId])
}

export default {
  status,
  eject,
  tracksList,
  assignRecording
}
