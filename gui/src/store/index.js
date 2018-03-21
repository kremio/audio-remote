import Vuex from 'vuex'

import cd from './modules/cd'

export default {
  state:{
    playing: false,
    medium: undefined,
    volume: 1.0,
  },
  modules:{
    cd
  },
  mutations: {
    changeVolume(state, level){
      state.volume = level
    }
  }
}
