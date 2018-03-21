import api from "./index.js"

console.log(api)
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
