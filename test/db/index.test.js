const Db = require('../../db').default
const DBMigrate = require('db-migrate')
const path = require('path')

const cdFactory = require('../factories/cd')
const compilationFactory = require('../factories/compilation')
const recordingFactory = require('../factories/recording')
const artistFactory = require('../factories/artist')

let db
let dbmigrate

describe('Database queries', () => {

  //Setup test db: run all migrations and open db connection
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

  //Release db connection
  afterAll( () => {
    db.close()
  })

  //Clear all test data
  afterEach( async () => {
    function deleteData( tableName ){
      return new Promise( (success, failure) => {
        db.db.run(`DELETE FROM ${tableName}`, (err) => {
          if (err) {
            failure(err)
          }
          success( )
        })
      })
    }

    //Clear all data
    const tables = await db.tables()
    return Promise.all( tables.map((table) => deleteData(table.name) ) )
  })

  test('Inserting CD', async () => {
    const cdsBefore = await db.cds()
    expect( cdsBefore ).toHaveLength(0)
    const cd = await cdFactory.create(db)
    const cdsAfter = await db.cds()

    expect( cdsAfter ).toHaveLength(1)
    expect( cdsAfter[0] ).toEqual(Object.assign({},cd,{
      compilation: null
    })
    )
  })

  test('Inserting compilation', async () => {
    const compilationsBefore = await db.compilations()
    expect( compilationsBefore ).toHaveLength(0)
    const compilation = await compilationFactory.create(db)
    const compilationsAfter = await db.compilations()

    expect( compilationsAfter ).toHaveLength(1)
    expect( compilationsAfter[0] ).toEqual(Object.assign({},compilation,{
      mbid: null,
      cover: null
    }))
  })

  test('Insert CD with compilation', async () => {
    const cdsBefore = await db.cds()
    expect( cdsBefore ).toHaveLength(0)
    const compilationsBefore = await db.compilations()
    expect( compilationsBefore ).toHaveLength(0)

    const cd = await cdFactory.createWithCompilation(db)
    const cdsAfter = await db.cds()
    const compilationsAfter = await db.compilations()

    expect( cdsAfter ).toHaveLength(1)
    expect( compilationsAfter ).toHaveLength(1)
    expect( cdsAfter[0] ).toEqual(cd)
  })

  test('Inserting recording', async () => {
    const recordingsBefore = await db.recordings()
    expect( recordingsBefore ).toHaveLength(0)

    const recording = await recordingFactory.create(db)
    const recordingsAfter = await db.recordings()

    expect( recordingsAfter ).toHaveLength(1)
    expect( recordingsAfter[0] ).toEqual(recording)
  })

  test('Inserting compilation with recordings', async () => {
    const compilationsBefore = await db.compilations()
    expect( compilationsBefore ).toHaveLength(0)
    const recordingsBefore = await db.recordings()
    expect( recordingsBefore ).toHaveLength(0)

    const compilation = await compilationFactory.createWithRecordings(db)
    const storedCompilation = await db.compilationWithRecordings( compilation.id )
    expect( storedCompilation ).toEqual( compilation )
  })

  test('Inserting artist', async () => {
    const artistsBefore = await db.artists()
    expect( artistsBefore ).toHaveLength(0)
    const artist = await artistFactory.create(db)
    const artistsAfter = await db.artists()

    expect( artistsAfter ).toHaveLength(1)
    expect( artistsAfter[0] ).toEqual( artist )
  })

  test('Inserting recording with artists', async () => {
    const recordingsBefore = await db.recordings()
    expect( recordingsBefore ).toHaveLength(0)
    const artistsBefore = await db.artists()
    expect( artistsBefore ).toHaveLength(0)

    const recording = await recordingFactory.createWithArtists(db)
    const storedRecording = await db.recordingWithArtists( recording.id )
    expect( storedRecording ).toEqual( recording )
  })

})
