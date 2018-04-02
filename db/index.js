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

  async tables(){
    const sql = "SELECT name FROM sqlite_master WHERE type='table'"
    return this.all(sql)
  }

  async cds(){
    const sql = "SELECT * FROM cds"
    return this.all(sql)
  }

  insertCd(discid){
    return new Promise( (success, failure) => {
      this.db.run(`INSERT INTO cds(id) VALUES(?)`, [discid], (err) => {
        if (err) {
          failure(err)
        }
        success( discid ) //return the last insert id
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
