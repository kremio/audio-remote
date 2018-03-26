import api from "./index.js"

function status(){
  return api.emit("player.status.get")
}

function playPause(){
  return api.emit("player.play.toggle")
}

function seek(to){
  return api.emit("player.seek",[to])
}

export default {
  status,
  playPause,
  seek
}
