import Vuex from 'vuex'

//Store modules
import cd from './modules/cd'
import player from './modules/player'
import playlist from './modules/playlist'
import search from './modules/search'

//Async remote API
import Volume from '../api/volume'

export default {
  state:{
    playing: false,
    medium: undefined,
    volume: 100,
  },
  modules:{
    cd,
    player,
    playlist,
    search
  },
  mutations: {
    changeVolume(state, level){
      state.volume = level
    }
  },
  actions: {
    setVolume({state, commit}, volume){
      Volume.set(volume)
        .then( (status) => {
          commit('changeVolume', status.volume)
        })
        .catch((err) => {
          console.log("Error setting volume", err)
        })
    },
    getVolume({commit}){
      console.log("getVolume")
      Volume.get()
        .then( (status) => {
          commit('changeVolume', status.volume)
        })
        .catch((err) => {
          console.log("Error getting volume", err)
        })

    }
  }
}
