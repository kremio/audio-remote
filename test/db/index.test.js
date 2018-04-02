const Db = require('../../db').default
const DBMigrate = require('db-migrate')
const path = require('path')

let db
let dbmigrate

describe('Database queries', () => {

  beforeAll( (done) => {
    dbmigrate =  DBMigrate.getInstance(true,{
      config: path.resolve(__dirname, '../../config/database.json'),
      env: 'test'
    }, (driver, instance, cb) => {
      if(!db){
        db = new Db( driver._driver.connection )
        done()
      }
      cb()
    })

    dbmigrate.silence(true)
    dbmigrate.up()

  })

  afterAll( () => {
    db.close()
  })

  afterEach( (done) => {
    dbmigrate.reset()
      .then( () => {
        dbmigrate.up().then(() => {
          done()
        })
      })
  })

  test('Inserting CD', async () => {
    const cdsBefore = await db.cds()
    expect( cdsBefore ).toHaveLength(0)
    const insertedId = await db.insertCd( 'a-bogus-discid' )
    const cdsAfter = await db.cds()

    expect( cdsAfter ).toHaveLength(1)
    expect( cdsAfter[0] ).toEqual({
      id: insertedId,
      compilation: null
    })
  })

  test('Inserting compilation', async () => {
    const compilationsBefore = await db.compilations()
    expect( compilationsBefore ).toHaveLength(0)
    const compilation = {
      title: "A great compilation of dance songs",
      date: "1989-10-02"
    }
    const insertedId = await db.insertCompilation( compilation )
    const compilationsAfter = await db.compilations()

    expect( compilationsAfter ).toHaveLength(1)
    expect( compilationsAfter[0] ).toEqual(Object.assign({},compilation,{
      id: insertedId,
      mbid: null,
      cover: null
    }))
  })

  test('Inserting recording', async () => {
    const recordingsBefore = await db.recordings()
    expect( recordingsBefore ).toHaveLength(0)
    const recording = {
      title: "A great dance song",
      date: "1989-10-02",
      duration: 20.33
    }
    const insertedId = await db.insertRecording( recording )
    const recordingsAfter = await db.recordings()

    expect( recordingsAfter ).toHaveLength(1)
    expect( recordingsAfter[0] ).toEqual(Object.assign({},recording,{
      id: insertedId
    }))
  })

  test('Inserting artist', async () => {
    const artistsBefore = await db.artists()
    expect( artistsBefore ).toHaveLength(0)
    const artist = {
      name: "Billy Bob, Jr."
    }
    const insertedId = await db.insertArtist( artist )
    const artistsAfter = await db.artists()

    expect( artistsAfter ).toHaveLength(1)
    expect( artistsAfter[0] ).toEqual(Object.assign({}, artist,{
      id: insertedId
    }))
  })

})
