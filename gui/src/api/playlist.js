import api from "./index.js"

function get(){
  return api.emit("playlist.get")
}

function previous(){
  return api.emit("playlist.previous")
}

function next(){
  return api.emit("playlist.next")
}

function playFrom(file){
  return api.emit("playlist.playFrom", [file])
}

export default {
  get,
  previous,
  next,
  playFrom
}

