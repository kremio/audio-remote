const node_path = require('path')
jest.mock('fs')
const mockFs = require('fs')

/*** TEST AUTO API MODULES LOADING ***/
/*
 * This test is different from the other as it relies
 * on the code under test to attempt to load the modules
 * specified in a mock file system structure.
 * The test will fail if an attempt is made to load a module
 * that is not mocked.
 */

// Set up some mocked out API modules
const mockPluginModule = jest.fn()

//Setup virtual mocks
jest.mock(
  '../../plugins/test_module.api.js',
  () => (...params) => mockPluginModule(...params),
  {virtual: true}
)

jest.mock(
  '../../plugins/extra/extra_module.api.js',
  () => (...params) => mockPluginModule(...params),
  {virtual: true}
)

// Create the corresponding mocked filesystem
const pluginsDirRoot = node_path.resolve(__dirname, '../../plugins/')
const subFolder = node_path.join( pluginsDirRoot, 'extra')

mockFs.__setMockFile( 'test_module.api.js', pluginsDirRoot )
mockFs.__setMockFile( 'test_module.js',pluginsDirRoot )
mockFs.__setMockFile( 'index.js', subFolder  )
mockFs.__setMockFile( 'extra_module.api.js', subFolder  )

let emit, register

beforeAll( (done) => {
  const api = require('../../api/index')
  emit = api.emit
  register = api.register
  register('api.ready', done)
})

describe('Auto-loading plugins modules', () => {


  test('Inject the emit and register functions into the plugins', () => {
    expect( mockPluginModule.mock.calls.length ).toBe(2)
    expect( mockPluginModule.mock.calls[0][0] ).toEqual({emit,register})
    expect( mockPluginModule.mock.calls[0][0] ).toEqual( mockPluginModule.mock.calls[1][0] )
  })
})

describe('Registering message listeners', () => {


  test('Registering a single listener', (done) => {
    function listener(){
      done()
    }

    register('some.message', listener)
    emit('some.message')
  })

  test('Registering a listener that takes parameters', (done) => {
    function listener( paramA, paramB ){
      expect(paramA).toEqual('foo')
      expect(paramB).toEqual('bar')
      done()
    }

    register('some.message.with.params', listener)
    emit('some.message.with.params', ['foo', 'bar'])
  })


  test('Registering multiple listeners of the same message', () => {
    function listenerA(){
      return {listenerA:'done'}
    }

    function listenerB(){
      return {listenerB:'done'}
    }


    register('another.message', listenerA)
    register('another.message', listenerB)
    const result = emit('another.message')
    expect(result).toContainEqual( listenerA() )
    expect(result).toContainEqual( listenerB() )
  })
})

describe('Emitting messages', () => {
  test('Emit message without listeners', () => {
    const result = emit('no.answer')
    expect(result).toEqual([])
  })

  test('Handlers can be asynchronous', async () => {
    let tooLate = false
    async function listenerA(){
      return new Promise( (ok) => {
        setTimeout( () =>{
          tooLate = true
          ok('A done')
        })
      }, 5000)
    }

    function listenerB( ){
      expect(tooLate).toBe(false)
      return 'B done'
    }

    register('async.listener.test', listenerA)
    register('async.listener.test', listenerB)
    const result = await Promise.all( emit('async.listener.test') )
    expect(tooLate).toBe(true)
    expect(result).toEqual(['A done','B done'])
  })
})
