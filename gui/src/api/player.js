import api from "./index.js"

function status(){
  return api.emit("player.status.get")
}

function playPause(){
  return api.emit("player.play.toggle")
}


export default {
  status,
  playPause,
}
