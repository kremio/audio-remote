import Playlist from '../../api/playlist'

export default {
  namespaced:true,
  state:{
    files: undefined
  },
  mutations: {
    setFilesList(state, list){
      state.files = list
    }
  },
  actions:{
    getFilesList({ state, commit }){
      Playlist.get()
        .then( (files) => {
          commit('setFilesList', files)
        })
        .catch((err) => {
          console.log("Error fetching list of files in playlist", err)
        })
    }
  }
}
