jest.mock('child_process')
const mockChildProcess = require('child_process')

const path = require('path')

const mockApiRegister = jest.fn()
const mockApiEmit = jest.fn()


const mockCdWatcher = {
    on: jest.fn(),
    send: jest.fn()
}

const mockEjectCmd = jest.fn()

mockChildProcess.__setMockChildProc('fork', path.resolve(__dirname,'../../plugins/cd-watcher'), mockCdWatcher)
mockChildProcess.__setMockChildProc('exec', 'eject', mockEjectCmd )



beforeEach( () => {
  jest.resetAllMocks()
})


describe('On API ready', () => {
  test('fork a cd-watcher module and get current status', async () => {

    require('../../plugins/cd.api.js')({
      emit: mockApiEmit,
      register: mockApiRegister
    })

    expect( mockApiRegister ).toBeCalledWith('api.ready', expect.any(Function) )

    expect( mockCdWatcher.on ).not.toHaveBeenCalled()
    expect( mockCdWatcher.send ).not.toHaveBeenCalled()

    await mockApiRegister.mock.calls
      .find( (args) => args[0] == 'api.ready')[1]()

    expect( mockCdWatcher.on ).toHaveBeenCalledWith('message', expect.any(Function) )
    //Check if the current status was queried
    expect( mockCdWatcher.send ).toHaveBeenCalledWith('status' )
  })
})

test('Emits cd.status.changed when the CD drive state changes', async () => {

    require('../../plugins/cd.api.js')({
      emit: mockApiEmit,
      register: mockApiRegister
    })

    await mockApiRegister.mock.calls
      .find( (args) => args[0] == 'api.ready')[1]()

    expect( mockApiEmit ).not.toHaveBeenCalled()

    let cdState = 'wabadi'
    const messageHandler = mockCdWatcher.on.mock.calls
      .find( (args) => args[0] == 'message')[1]
    
    await messageHandler({cdAvailable: cdState})

    expect( mockApiEmit ).toHaveBeenCalledWith('cd.status.changed', [cdState])

    //should not emit again for the same state
    await messageHandler({cdAvailable: cdState})
    expect( mockApiEmit ).toHaveBeenCalledTimes(1)

    cdState = 'wabadoo'
    await messageHandler({cdAvailable: cdState})
    expect( mockApiEmit ).toHaveBeenCalledTimes(2)
    expect( mockApiEmit ).toHaveBeenCalledWith('cd.status.changed', [cdState])
})

test('Responds to cd.status.get with a boolean indicating the availability of a CD in the drive', async () => {
  
  require('../../plugins/cd.api.js')({
      emit: mockApiEmit,
      register: mockApiRegister
  })

  expect( mockApiRegister ).toBeCalledWith('cd.status.get', expect.any(Function) )

  const listener = mockApiRegister.mock.calls
    .find( (args) => args[0] == 'cd.status.get')[1]

  expect( await listener() ).toEqual({available: false})

  await mockApiRegister.mock.calls
      .find( (args) => args[0] == 'api.ready')[1]()

  const messageHandler = mockCdWatcher.on.mock.calls
    .find( (args) => args[0] == 'message')[1]

  await messageHandler({cdAvailable: 'yes'})

  expect( await listener() ).toEqual({available: true})
})

test('Calls the eject command on cd.eject', async () => {
  require('../../plugins/cd.api.js')({
    emit: mockApiEmit,
    register: mockApiRegister
  })

  expect( mockApiRegister ).toBeCalledWith('cd.eject', expect.any(Function) )

  const listener = mockApiRegister.mock.calls
    .find( (args) => args[0] == 'cd.eject')[1]

  expect( mockEjectCmd ).not.toHaveBeenCalled()

  await listener()

  expect( mockEjectCmd ).toHaveBeenCalledTimes(1)


})

