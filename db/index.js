const sqlite3 = require('sqlite3').verbose()

exports.default = class Db {
  constructor( dbConnection = undefined ){
    if( dbConnection ){
      this.db = dbConnection
    }else{
      const dbFile = __dirname + '/audio-remote.db'
      this.db = new sqlite3.Database(dbFile, (err) => {
        if (err) {
          throw err
        }
        console.log('Connected to the database.')
      })
    }

  }

  all(sql){
    return new Promise( (success, failure) => {
      this.db.serialize(() => {
        this.db.all(sql, [], (err, rows) => {
          if (err) {
            failure(err)
            return
          }
          success(rows)
        })
      })
    })
  }

  insertStatement( authorizedKeys, values, tableName ){
    const dataJSON = authorizedKeys.reduce( (acc, k) => {
      if(!values[k]){
        return acc
      }

      acc[k] = values[k]
      return acc
    }, {})

    const keys = Object.keys(dataJSON)
    
    return {
      data: keys.map((k) => dataJSON[k]),
      statement: `INSERT INTO ${tableName}(${keys.join(',')}) VALUES(${keys.map(() => '?').join(',')})`
    }
  }

  updateStatement( what, condition, tableName ){
    const set = Object.keys(what).map( (c) => `${c} = ?` )
      .join(',')
    const where = Object.keys(condition).map( (c) => `${c} = ?` )
      .join(',')
    return {
      data: Object.values(what).concat( Object.values(condition) ),
      statement: `UPDATE ${tableName} SET ${set} WHERE ${where}`
    }
  }

  doBulkInsert(authorizedKeys, data, table){
    //console.log("doBulkInsert", authorizedKeys, data, table)
    return new Promise( (success, failure) => {
      this.db.serialize( () => {
        this.db.run("begin transaction")
        data
          .map( (values) => this.insertStatement( authorizedKeys, values, table ) )
          .map( (insert) => this.db.prepare(insert.statement, insert.data) )
          .forEach( (stmt) => {
            //console.log(stmt)
            stmt.run()
            stmt.finalize()
          })
        
        this.db.run("commit", (err) => {
          if (err) {
            failure(err)
          }
          success( data )
        })
      })
    })
  }


  async tables(){
    const sql = "SELECT name FROM sqlite_master WHERE type='table'"
    return this.all(sql)
  }

  async cds(){
    const sql = "SELECT * FROM cds"
    return this.all(sql)
  }

  insertCd( cd ){
    return new Promise( (success, failure) => {
      const {statement, data} = this.insertStatement( ['id', 'compilation'], cd, 'cds' )
      this.db.run(statement, data, (err) => {
        if (err) {
          failure(err)
        }
        success( cd.id ) //return the last insert id
      })
    })
  }

  setCdCompilation( cd, compilation ){
    return new Promise( (success, failure) => {
      const {statement, data} = this.updateStatement({compilation: compilation.id}, {id: cd.id}, 'cds')
      this.db.run(statement, data, (err) => {
        if (err) {
          failure(err)
        }
        success( compilation.id )
      })
    })
  }

  async compilations(){
    const sql = "SELECT * FROM compilations"
    return this.all(sql)
  }

  insertCompilation( compilation ){
    return new Promise( (success, failure) => {
      const {statement, data} = this.insertStatement( ['title','mbid','date','cover'], compilation, 'compilations' )
      this.db.run(statement, data, function(err){
        if (err) {
          failure(err)
        }
        success( this.lastID ) //return the last insert id
      })
    })
  }

  async addCompilationRecordings( compilation, recordings ){
    const data = recordings.map( (recording, i) => {
      return {
        compilation_id: compilation.id,
        recording_id: recording.id,
        position: i+1
      }
    })
    const result = await this.doBulkInsert(['compilation_id', 'recording_id', 'position'], data, 'compilation_recordings')
    compilation.recordings = recordings.map( (recording,i) => Object.assign({}, recording, {position: i+1}) )
    return compilation
  }

  async compilationWithRecordings( compilationId ){
    const sql = "SELECT " +
      "compilations.id AS id,"+
      "compilations.title AS title,"+
      "compilations.mbid AS mbid,"+
      "compilations.date AS date,"+
      "compilations.cover AS cover,"+
      "recordings.id AS recordingId,"+
      "recordings.title AS recordingTitle,"+
      "recordings.date AS recordingDate,"+
      "recordings.duration AS recordingDuration,"+
      "compilation_recordings.position AS position "+
      "FROM "+
      "compilations " +
      `LEFT JOIN compilation_recordings ON compilation_recordings.compilation_id = ${compilationId} ` +
      "LEFT JOIN recordings ON recordings.id = compilation_recordings.recording_id"

    const rows = await this.all(sql)
    //console.log(rows)
    return rows.reduce( (acc, row, i, arr) => {
      if( !acc ){
        acc = {
          id: row.id,
          title: row.title,
          mbid: row.mbid,
          date: row.date,
          cover: row.cover,
          recordings: []
        }
      }

      acc.recordings.push({
        id: row.recordingId,
        position: row.position,
        title: row.recordingTitle,
        date: row.recordingDate,
        duration: row.recordingDuration
      })

      if( (arr.length - 1) == i ){ //sort by position
        acc.recordings.sort( (a,b) => {
          return a.position - b.position
        })
      }
      return acc

    },undefined)
  }

  async recordings(){
    const sql = "SELECT * FROM recordings"
    return this.all(sql)
  }

  insertRecording( recording ){
    return new Promise( (success, failure) => {
      const {statement, data} = this.insertStatement( ['title','date','duration'],  recording, 'recordings' )
      this.db.run(statement, data, function(err){
        if (err) {
          failure(err)
        }
        success( this.lastID ) //return the last insert id
      })
    })
  }

  async addRecordingArtists(recording, artists){
    const data = artists.map( (artist) => {
      return {
        artist_id: artist.id,
        recording_id: recording.id,
      }
    })
    const result = await this.doBulkInsert(['artist_id', 'recording_id'], data, 'recording_artists')
    recording.artists = artists
    return recording
  }
  
  async recordingWithArtists( recordingId ){
    const sql = "SELECT " +
      "recordings.id AS id,"+
      "recordings.title AS title,"+
      "recordings.date AS date,"+
      "recordings.duration AS duration,"+
      "artists.id AS artistId,"+
      "artists.name AS artistName "+
      "FROM "+
      "recordings " +
      `LEFT JOIN recording_artists ON recording_artists.recording_id = ${recordingId} ` +
      "LEFT JOIN artists ON artists.id = recording_artists.artist_id"

    const rows = await this.all(sql)

    return rows.reduce( (acc, row, i, arr) => {
      if( !acc ){
        acc = {
          id: row.id,
          title: row.title,
          date: row.date,
          duration: row.duration,
          artists: []
        }
      }

      acc.artists.push({
        id: row.artistId,
        name: row.artistName,
      })

      return acc

    },undefined)
  }


  async artists(){
    const sql = "SELECT * FROM artists"
    return this.all(sql)
  }

  insertArtist( artist ){
    return new Promise( (success, failure) => {
      const {statement, data} = this.insertStatement( ['name'], artist, 'artists' )
      this.db.run(statement, data, function(err){
        if (err) {
          failure(err)
        }
        success( this.lastID ) //return the last insert id
      })
    })
  }


  close(){
    this.db.close((err) => {
      if (err) {
        throw err
      }
      console.log('Database connection closed.')
    })
  }
}
