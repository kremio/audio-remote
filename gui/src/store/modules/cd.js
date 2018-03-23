import Cd from '../../api/cd'
export default {
  namespaced: true,
  state: {
    available: false,
    tracksList: undefined
  },
  mutations: {
    availabilityChanged(state){
      state.available = !state.available
    },
    setTracksList(state, list){
      state.tracksList = list
    }
  },
  actions:{
    checkStatus({ state, commit, dispatch }){
      Cd.status()
        .then( (status) => {
          if( status.available != state.available  ){
            commit('availabilityChanged')
            if( status.available ){ //let's get the tracks list
               dispatch('getTracksList')
            }else{
              commit('setTracksList', undefined)
            }
          }
        })
        .catch((err) => {
          console.log("Error fetching CD drive status", err)
        })
    },
    getTracksList({ state, commit, dispatch }){
      Cd.tracksList()
        .then( (tracks) => {
          commit('setTracksList', tracks)
          if(tracks.temporary){ //let's try again in a bit
            setTimeout(() => dispatch('getTracksList'), 3000)
          }
        })
    }
  }
}
