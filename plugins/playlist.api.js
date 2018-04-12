module.exports = function(api){

  class Playlist {
    constructor( files ){
      this._files = files
      this._workingList = undefined
      this._currentFile = undefined
    }

    set currentFile(file){
      this._currentFile = file
    }

    get currentFile(){
      return this._currentFile
    }

    set files(files){
      this._files = files
      this.workingList = files
    }

    get files(){
      return this._files
    }

    set workingList(files){
      this._workingList = files
      api.emit('player.play.list', this._workingList)
    }

    //Play a partial sequence starting from the given file
    toFile( startFile ){
      let fileFound = false
      this.workingList = this.files.reduce( (acc, file) => {
        if( !fileFound && file == startFile ){
          fileFound = true
        }
        if( fileFound ){
          acc.push(file)
        }
        return acc
      }, [])
    }

    previous(){
      const previous = this.files.find( (file,i,files) => {
        return i < files.length - 1 && files[i+1] == this._currentFile
      })
      if( !previous ){
        console.log("Already at the beginning of the playlist")
        return
      }

      if( !this._workingList.includes( previous ) ){
        this.toFile(previous)
      }
    }
  }

  const playlist = new Playlist([])


  api.register('playlist.get', () => {
    return playlist.files
  })

  api.register('cd.status.changed', async (trackCount) => {
    if(!trackCount){
      playlist.files = []
      return
    }

    //Create a playlist for the cd and start playing it
    const filesList = []
    for(let i = 1; i <= trackCount; i++){
      filesList.push(`cdda://${i}`)
    }

    playlist.files = filesList
  })

  api.register('playlist.playFrom', async (file) => {
    playlist.toFile( file )
  })

  /*
   * IMPORTANT:
   * while playlist.previous will emit a player.play.list,
   * the player monitoring code MUST emit playlist.currentfile.set(fileName)
   * once the file is actually being played to maintain the playlist
   * in synch.
   */
  api.register('playlist.currentfile.set', async (file) => {
    playlist.currentFile = file
  })

  api.register('playlist.previous', async () => {
    playlist.previous()
  })

}
