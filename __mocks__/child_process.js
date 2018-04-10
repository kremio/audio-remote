
const child_process = jest.genMockFromModule('child_process')

const mockedChildProc = {  }

function __setMockChildProc( method, commandOrModule, mock){
  if( !mockedChildProc[method] ){
    mockedChildProc[method] = {}
  }

  mockedChildProc[method][commandOrModule] = mock
}


function fork( module, params ){
  if( mockedChildProc.fork && mockedChildProc.fork[module] ){
    return mockedChildProc.fork[module]
  }

  throw Error(`Trying to fork non-mocked module ${module}.`)
}

function exec( command, params ){
  if( mockedChildProc.exec && mockedChildProc.exec[command] ){
    return mockedChildProc.exec[command]()
  }

  throw Error(`Trying to exec non-mocked command ${command}.`)
}

child_process.__setMockChildProc = __setMockChildProc
child_process.fork = fork
child_process.exec = exec


module.exports = child_process
