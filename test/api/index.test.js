const {emit, register} = require('../../api/index')

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
