import api from "./index.js"

function status(){
  return api.emit("cd.status.get")
}

function eject(){
  return api.emit("cd.eject")
}

export default {
  status,
  eject
}
