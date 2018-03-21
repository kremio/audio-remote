import api from "./index.js"

function get(){
  return api.emit("volume.get")
}

function set(volume){
  return api.emit("volume.set",[volume])
}

export default {
  get,
  set
}
