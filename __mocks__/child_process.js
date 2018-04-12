
const child_process = jest.genMockFromModule('child_process')

const mockedChildProc = {  }

function __setMockChildProc( method, commandOrModule, mock){
  if( !mockedChildProc[method] ){
    mockedChildProc[method] = {}
  }

  mockedChildProc[method][commandOrModule] = mock
}


function fork( module, ...params ){
  if( mockedChildProc.fork && mockedChildProc.fork[module] ){
    return mockedChildProc.fork[module]/*(...params)*/
  }

  throw Error(`Trying to fork non-mocked module: ${module}.`)
}

function exec( command, cb ){
  //console.log( mockedChildProc.exec[command] )
  if( mockedChildProc.exec && mockedChildProc.exec[command] ){
    if( cb ){
      cb( null, mockedChildProc.exec[command]() )
    }else{
      mockedChildProc.exec[command]()
    }
    return
  }

  cb( new Error(`Trying to exec non-mocked command: ${command}.`) )
}

child_process.__setMockChildProc = __setMockChildProc
child_process.fork = fork
child_process.exec = exec


module.exports = child_process
