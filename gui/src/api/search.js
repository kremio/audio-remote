import api from "./index.js"

function cd(params){
  console.log(params)
  return api.emit("search.cd", params)
}

export default {
  cd
}
