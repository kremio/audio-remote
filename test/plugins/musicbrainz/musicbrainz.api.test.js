jest.mock('../../../plugins/musicbrainz/index')


const musicbrainzFactory = require('../../factories/musicbrainz')

const mockApiRegister = jest.fn()
const mockApiEmit = jest.fn()

const cdData = Object.assign({},musicbrainzFactory.releaseDocument)
const tracksInfo = cdData.tracks
delete cdData.tracks


beforeEach( () => {
  jest.resetAllMocks()
  require('../../../plugins/musicbrainz/musicbrainz.api.js')({
    emit: mockApiEmit,
    register: mockApiRegister
  })
})

test('On cd.toc.ready(TOC), fetch album data from Musicbrainz', async () => {
  expect( mockApiRegister ).toBeCalledWith('cd.toc.ready', expect.any(Function) )

  await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'cd.toc.ready')[1]([1,2,3])

  expect( mockApiEmit ).toBeCalledWith('cd.trackslist.update', [ cdData, tracksInfo ] )

  //Case when the Musicbrainz service does not return a match
  await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'cd.toc.ready')[1]()

  expect( mockApiEmit ).toBeCalledWith( 'cd.trackslist.notfound' )
})

test('On cd.recording.set(recordingId), fetch recording data from Musicbrainz', async () => {
  expect( mockApiRegister ).toBeCalledWith('cd.recording.set', expect.any(Function) )

  await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'cd.recording.set')[1]('someId')

  expect( mockApiEmit ).toBeCalledWith('cd.trackslist.update', [ cdData, tracksInfo ] )

  //Case when the Musicbrainz service does not return a match
  await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'cd.recording.set')[1]()

  expect( mockApiEmit ).toBeCalledWith( 'cd.trackslist.notfound' )
})

test('On search.cd(title, artist), query the Musicbrainz database, adding the CD tracks count', async () => {
  expect( mockApiRegister ).toBeCalledWith('search.cd', expect.any(Function) )

  const title = 'someTitle'
  const artist = 'someArtist'
  const tracksCount = 33

  mockApiEmit
    .mockReturnValueOnce( tracksCount )

  const result = await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'search.cd')[1]('someTitle','someArtist')

  expect( mockApiEmit ).toHaveBeenCalledWith('cd.trackslist.count.get')

  expect( result ).toEqual( {
    title,
    artist,
    tracksCount
  } )

  




  
})
