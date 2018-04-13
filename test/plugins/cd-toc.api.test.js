jest.mock('child_process')

const mockChildProcess = require('child_process')

const mockApiRegister = jest.fn()
const mockApiEmit = jest.fn()

const DISCID_RESULT = "17 150 11023 22990 34313 45134 56947 68039 79455 91417 121962 138245 147228 161148 179829 200787 206971 212909 229499"
const TOC = DISCID_RESULT.split(' ')
  .slice(1)
  .map( (v) => Number(v) )
const mockDiscidCmd = jest.fn()

mockChildProcess.__setMockChildProc('exec', 'cd-discid --musicbrainz', () => {
  mockDiscidCmd()
  return {stdout: DISCID_RESULT, stderr: null}
})

beforeEach( () => {
  jest.resetAllMocks()
  require('../../plugins/cd-toc.api.js')({
    emit: mockApiEmit,
    register: mockApiRegister
  })
})

describe('Playlist initialisation', () => {
  test('Initialize the playlist to undefined on cd.status.changed(false)', async () => {

    await mockApiRegister.mock.calls
      .find( (args) => args[0] == 'cd.status.changed')[1](false)

    expect( mockDiscidCmd ).not.toHaveBeenCalled()

    expect( mockApiEmit ).not.toHaveBeenCalled()
  })


  test('Reads the CD TOC on cd.status.changed(true) and emits cd.toc.ready', async () => {

    expect( mockApiRegister ).toBeCalledWith('cd.status.changed', expect.any(Function) )

    expect( mockApiEmit ).not.toHaveBeenCalled( )

    expect( mockDiscidCmd ).not.toHaveBeenCalled()

    await mockApiRegister.mock.calls
      .find( (args) => args[0] == 'cd.status.changed')[1](true)

    expect( mockDiscidCmd ).toHaveBeenCalledTimes(1)

    expect( mockApiEmit ).toBeCalledWith( 'cd.toc.ready', TOC )
  })
})

describe('Getting and setting', () => {

  beforeEach( async () => {
    //Reset playlist
    await mockApiRegister.mock.calls
      .find( (args) => args[0] == 'cd.status.changed')[1](false)
  })

  test('Returns the current tracks list on cd.trackslist.get', async () => {

    expect( mockApiRegister ).toBeCalledWith('cd.trackslist.get', expect.any(Function) )

    await mockApiRegister.mock.calls
      .find( (args) => args[0] == 'cd.status.changed')[1](true)

    const tracksList = await mockApiRegister.mock.calls
      .find( (args) => args[0] == 'cd.trackslist.get')[1]()

    expect( tracksList.title ).toEqual('unknown')
    expect( tracksList.temporary ).toEqual(true)
    expect( tracksList.tracks ).toHaveLength( TOC.length - 1 )
    tracksList.tracks.forEach( (track, i) => {
      expect( Object.keys(track) ).toEqual( expect.arrayContaining(['title', 'file', 'duration']) )
      expect( track.title ).toEqual(`Track ${i+1}`)
      expect( track.file ).toEqual(`cdda://${i+1}`)
    })
  })


  test('Update the tracks list on cd.trackslist.update(albumInfo, tracksInfo)', async () => {

    expect( mockApiRegister ).toBeCalledWith('cd.trackslist.update', expect.any(Function) )

    const albumInfo = {title:'Test Album'}
    const tracks = [...(new Array(TOC.length - 1))].map((v,i)=>{
      return {foo:`bar${i}`, position: i+1}
    })
    await mockApiRegister.mock.calls
      .find( (args) => args[0] == 'cd.trackslist.update')[1](albumInfo, tracks)

    let tracksList = await mockApiRegister.mock.calls
      .find( (args) => args[0] == 'cd.trackslist.get')[1]()

    expect( tracksList ).toEqual( Object.assign(albumInfo, {tracks}) )

    const moreAlbumInfo = {year:2018}
    const moreTracks = [...(new Array(TOC.length - 1))].map((v,i)=>{
      return {bar:`foo${i}`, position: i+1}
    })

    await mockApiRegister.mock.calls
      .find( (args) => args[0] == 'cd.trackslist.update')[1](moreAlbumInfo, moreTracks)

    tracksList = await mockApiRegister.mock.calls
      .find( (args) => args[0] == 'cd.trackslist.get')[1]()

    expect( tracksList ).toEqual( Object.assign(
      albumInfo,
      moreAlbumInfo,
      {
        tracks: tracks.map( (track, i) => Object.assign(track, moreTracks[i]) )
      })
    )
  })


  test('Updating the tracks list removes the "temporary" attribute', async () => {
    await mockApiRegister.mock.calls
      .find( (args) => args[0] == 'cd.status.changed')[1](true)

   let tracksList = await mockApiRegister.mock.calls
     .find( (args) => args[0] == 'cd.trackslist.get')[1]()

   expect( tracksList.temporary ).toEqual(true)

   await mockApiRegister.mock.calls
     .find( (args) => args[0] == 'cd.trackslist.update')[1]({bloobee:'boolga'})

   tracksList = await mockApiRegister.mock.calls
     .find( (args) => args[0] == 'cd.trackslist.get')[1]()

   expect( tracksList.temporary ).toBeUndefined()
  })

  test('Removes the "temporary" attribute and adds the "notfound" attribute on cd.trackslist.notfound', async () => {

    expect( mockApiRegister ).toBeCalledWith('cd.trackslist.notfound', expect.any(Function) )


    await mockApiRegister.mock.calls
      .find( (args) => args[0] == 'cd.status.changed')[1](true)

    let tracksList = await mockApiRegister.mock.calls
     .find( (args) => args[0] == 'cd.trackslist.get')[1]()

    expect( tracksList.temporary ).toEqual(true)
    expect( tracksList.notfound ).toBeUndefined()

    await mockApiRegister.mock.calls
      .find( (args) => args[0] == 'cd.trackslist.notfound')[1]()

    tracksList = await mockApiRegister.mock.calls
     .find( (args) => args[0] == 'cd.trackslist.get')[1]()

    expect( tracksList.temporary ).toBeUndefined()
    expect( tracksList.notfound ).toEqual(true)
  })

  test('Adds the "temporary" attribute on cd.recording.set', async () => {
    expect( mockApiRegister ).toBeCalledWith('cd.recording.set', expect.any(Function) )

   await mockApiRegister.mock.calls
     .find( (args) => args[0] == 'cd.trackslist.update')[1]({bloobee:'boolga'})

   let tracksList = await mockApiRegister.mock.calls
     .find( (args) => args[0] == 'cd.trackslist.get')[1]()

   expect( tracksList.temporary ).toBeUndefined()

   await mockApiRegister.mock.calls
     .find( (args) => args[0] == 'cd.recording.set')[1]()

   tracksList = await mockApiRegister.mock.calls
     .find( (args) => args[0] == 'cd.trackslist.get')[1]()

   expect( tracksList.temporary ).toBe(true)

  })


  test('Returns the given track duration on cd.trackslist.track.duration(trackFile)', async () => {

    expect( mockApiRegister ).toBeCalledWith('cd.trackslist.track.duration', expect.any(Function) )

    await mockApiRegister.mock.calls
      .find( (args) => args[0] == 'cd.status.changed')[1](false)

    await mockApiRegister.mock.calls
      .find( (args) => args[0] == 'cd.status.changed')[1](true)

    const duration = await mockApiRegister.mock.calls
      .find( (args) => args[0] == 'cd.trackslist.track.duration')[1]('cdda://12')

    //The revolution will be live!
    expect( Number(duration) ).toEqual( 185.6 ) //duration returned by mplayer
  })

  test('Returns the number of tracks on cd.trackslist.count.get', async () => {

    expect( mockApiRegister ).toBeCalledWith('cd.trackslist.count.get', expect.any(Function) )

    await mockApiRegister.mock.calls
      .find( (args) => args[0] == 'cd.status.changed')[1](true)

    const count = await mockApiRegister.mock.calls
      .find( (args) => args[0] == 'cd.trackslist.count.get')[1]()

    expect( count ).toEqual( TOC.length - 1 )

  })

})
