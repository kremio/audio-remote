import Player from '../../api/player'
export default {
  namespaced: true,
  state: {
    playing: false,
    playingCD: false,
    playingFile: undefined
  },
  mutations: {
    update(state, newState){
      Object.assign(state, newState)
    }
  },
  actions:{
    checkStatus({ state, commit }){
      Player.status()
        .then( (status) => {
          if( status.playing != state.playing || status.playingFile != state.playingFile ){
            commit('update', status)
          }
        })
        .catch((err) => {
          console.log("Error fetching Player status", err)
        })
    }
  }
}
