import api from "./index.js"

function status(){
  return api.emit("player.status.get")
}

function playPause(){
  return api.emit("player.play.toggle")
}

function previous(){
  return api.emit("player.playlist.previous")
}

function next(){
  return api.emit("player.playlist.next")
}

function jumpTo(position){
  return api.emit("player.playlist.jumpTo", [position])
}

export default {
  status,
  playPause,
  previous,
  next,
  jumpTo
}
