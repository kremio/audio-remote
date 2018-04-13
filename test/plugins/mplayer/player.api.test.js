const MPlayer = require('mplayer')

jest.mock('mplayer')

jest.mock('fs')
const mockFs = require('fs')

const mockApiRegister = jest.fn()
const mockApiEmit = jest.fn()

const FILES_LIST = ['cdda://1','cdda://2','cdda://3']
const tmpPlayList = '/tmp/audio_remote_playlist.m3u'

beforeEach( () => {
  jest.resetAllMocks()
  require('../../../plugins/mplayer/player.api.js')({
    emit: mockApiEmit,
    register: mockApiRegister
  })
})


test('On player.play.list([files]), update the playlist file and start playback', async () => {
  expect( mockApiRegister ).toBeCalledWith('player.play.list', expect.any(Function) )

  await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'player.play.list')[1](...FILES_LIST)

  expect( mockFs.writeFile ).toBeCalledWith( tmpPlayList, FILES_LIST.join('\n'), expect.any(Function) )

  mockFs.writeFile.mock.calls[0][2]()

  const mockMplayer = MPlayer.mock.instances[0]

  expect( mockMplayer.openPlaylist ).toBeCalledWith( tmpPlayList )
})


test('On playlist.previous/next, call MPlayer.previous/next', async () => {
  expect( mockApiRegister ).toBeCalledWith('playlist.previous', expect.any(Function) )
  expect( mockApiRegister ).toBeCalledWith('playlist.next', expect.any(Function) )

  const mockMplayer = MPlayer.mock.instances[0]

  await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'playlist.previous')[1]()

  expect( mockMplayer.previous ).toBeCalled( )

  await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'playlist.next')[1]()

  expect( mockMplayer.next ).toBeCalled( )
})

test('On player.seek(seconds), call MPlayer.seek', async () => {
  expect( mockApiRegister ).toBeCalledWith('player.seek', expect.any(Function) )

  const mockMplayer = MPlayer.mock.instances[0]

  const someTime = Math.floor( Math.random() * 1000 )
  await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'player.seek')[1](someTime)

  expect( mockMplayer.seek ).toBeCalledWith( someTime )
})

test('On volume.set(volumePercent), constrain input between 0 and 150 % and call MPlayer.volume', async () => {
    expect( mockApiRegister ).toBeCalledWith('volume.set', expect.any(Function) )

  const mockMplayer = MPlayer.mock.instances[0]

  await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'volume.set')[1]( 50 )

  expect( mockMplayer.volume ).toBeCalledWith( 50 )

  await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'volume.set')[1]( -50 )

  expect( mockMplayer.volume ).toBeCalledWith( 0 )

  await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'volume.set')[1]( 500 )

  expect( mockMplayer.volume ).toBeCalledWith( 150 )
})

test('On player.status.get returns the current playback state', async () => {
  expect( mockApiRegister ).toBeCalledWith('player.status.get', expect.any(Function) )

  const status = await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'player.status.get')[1]()

  expect( Object.keys(status) )
    .toEqual( expect.arrayContaining(['playingFile','timeSeconds','duration','playing']) )
})

test('Listens to mplayer status message and update internal state', async () => {

  const mockMplayer = MPlayer.mock.instances[0]

  expect( mockMplayer.on ).toHaveBeenCalledWith( 'status', expect.any(Function) )

  const duration = 42
  const playingState = {
    filename: 'somefile',
    volume: 100
  }

  mockApiEmit
    .mockReturnValueOnce( null )
    .mockReturnValueOnce( duration )

  mockMplayer.on.mock.calls
    .find( (call) => call[0] == 'status' )[1](playingState)

  //Should have broadcasted the fact that a file is being played
  expect( mockApiEmit ).toBeCalledWith('playlist.currentfile.set', playingState.filename )

  //Should made a call to resolve the duration of the file
  expect( mockApiEmit ).toBeCalledWith('cd.trackslist.track.duration', playingState.filename )

  const status = await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'player.status.get')[1]()

  expect( status ).toEqual( expect.objectContaining({
    playingFile: playingState.filename,
    duration
  }) )

})

test('Listen to mplayer start/stop/time messages and update internal state', async () => {
  const mockMplayer = MPlayer.mock.instances[0]

  expect( mockMplayer.on ).toHaveBeenCalledWith( 'stop', expect.any(Function) )
  expect( mockMplayer.on ).toHaveBeenCalledWith( 'start', expect.any(Function) )
  expect( mockMplayer.on ).toHaveBeenCalledWith( 'time', expect.any(Function) )

  const initialStatus = {
    playing: false,
    timeSeconds: 0
  }

  let status = await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'player.status.get')[1]()
  expect( status ).toEqual(
    expect.objectContaining(
      initialStatus
    )
  )


  mockMplayer.on.mock.calls
    .find( (call) => call[0] == 'start' )[1]()

  status = await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'player.status.get')[1]()
  expect( status ).toEqual(
    expect.objectContaining(
      Object.assign( initialStatus, { playing: true })
    )
  )


  mockMplayer.on.mock.calls
    .find( (call) => call[0] == 'time' )[1](123)

  status = await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'player.status.get')[1]()
  expect( status ).toEqual(
    expect.objectContaining(
      Object.assign( initialStatus, { timeSeconds: 123 })
    )
  )

  mockMplayer.on.mock.calls
    .find( (call) => call[0] == 'stop' )[1]()

  status = await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'player.status.get')[1]()
  expect( status ).toEqual(
    expect.objectContaining(
      Object.assign( initialStatus, { playing: false })
    )
  )

})

test('On volume.get, return the current volume', async () => {
  expect( mockApiRegister ).toBeCalledWith('volume.get', expect.any(Function) )

  let volume = await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'volume.get')[1]()

  expect( volume ).toEqual( {volume: 100} ) //initial volume

  const mockMplayer = MPlayer.mock.instances[0]

  mockMplayer.on.mock.calls
    .find( (call) => call[0] == 'status' )[1]({volume: 125}) 

  volume = await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'volume.get')[1]()

  expect( volume ).toEqual( {volume: 125} )
})

test('On player.play.toggle, toggle between paused and playing', async () => {
  expect( mockApiRegister ).toBeCalledWith('player.play.toggle', expect.any(Function) )
  
  const mockMplayer = MPlayer.mock.instances[0]

  let status = await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'player.status.get')[1]()
  expect( status ).toEqual(
    expect.objectContaining(
      { playing: false }
    )
  )

  await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'player.play.toggle')[1]()

  expect( mockMplayer.play ).toBeCalled( )
  status = await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'player.status.get')[1]()
  expect( status ).toEqual(
    expect.objectContaining(
      { playing: true }
    )
  )

  await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'player.play.toggle')[1]()

  expect( mockMplayer.pause ).toBeCalled( )
  status = await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'player.status.get')[1]()
  expect( status ).toEqual(
    expect.objectContaining(
      { playing: false }
    )
  )

  await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'player.play.toggle')[1]()

  expect( mockMplayer.play ).toHaveBeenCalledTimes( 2 )
  status = await mockApiRegister.mock.calls
    .find( (args) => args[0] == 'player.status.get')[1]()
  expect( status ).toEqual(
    expect.objectContaining(
      { playing: true }
    )
  )
})
