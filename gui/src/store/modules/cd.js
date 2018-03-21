import Cd from '../../api/cd'
export default {
  namespaced: true,
  state: {
    available: false
  },
  mutations: {
    availabilityChanged(state){
      state.available = !state.available
    }
  },
  actions:{
    checkStatus({ state, commit }){
      Cd.status()
        .then( (status) => {
          if( status.available != state.available  ){
            commit('availabilityChanged')
          }
        })
        .catch((err) => {
          console.log("Error fetching CD drive status", err)
        })
    }
  }
}
