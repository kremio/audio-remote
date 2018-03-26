import Player from '../../api/player'
export default {
  namespaced: true,
  state: {
    playing: false,
    playingFile: undefined,
    timeSeconds: 0,
    duration: -1,
    temporaryTime: false
  },
  mutations: {
    update(state, newState){
      if( state.temporaryTime && newState.timeSeconds ){
        delete newState.timeSeconds
      }
      Object.assign(state, newState)
    },
    setTemporaryTime(state, time){
      state.temporaryTime = true
      state.timeSeconds = time
    }
  },
  actions:{
    checkStatus({ state, commit }){
      Player.status()
        .then( (status) => {
          const hasChanged = Object.keys(status).find( (k) => state.hasOwnProperty(k) && status[k] != state[k] )
          
          if( hasChanged ){
            commit('update', status)
          }
        })
        .catch((err) => {
          console.log("Error fetching Player status", err)
        })
    },
    seek({state, dispatch, commit}){
      Player.seek( state.timeSeconds ).then(() => {
        commit('update', {temporaryTime: false})
        dispatch('checkStatus')
      })
    }
  }
}
