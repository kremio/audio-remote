import Search from '../../api/search'
import Cd from '../../api/cd'

export default {
  namespaced: true,
  state: {
    results: undefined
  },
  mutations: {
    setResults(state, results){
      state.results = results
    },
    resetResults(state){
      state.results = undefined
    }
  },
  actions:{
    cd({state, commit}, params){
      console.log(params)
      Search.cd( params )
        .then( (results) => {
          commit('setResults',results)
        })
        .catch((err) => {
          console.log("Error searching for CD info", err)
        })
    },
    selectCd({state, dispatch, commit}, recordingId){
      Cd.assignRecording( recordingId )
        .then( (result) => {
          commit('resetResults')
          dispatch('cd/getTracksList',null, {root:true})
        })
        .catch((err) => {
          console.log("Error assigning a recording to a CD", err)
        })

    }
  }
}
