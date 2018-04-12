const path = require('path')

const fs = jest.genMockFromModule('fs')

const mockFileSystem = { isDir: true }

function __setMockFile( fileName, parentDir = '', root = mockFileSystem ){
  if( parentDir == '' ){ //reached the leaf
    root[fileName] = {isDir: false}
    return
  }

  //extract the current dir
  if( parentDir[0] == path.sep ){
    parentDir = parentDir.substr(1)
  }

  const dirPath = parentDir.split(path.sep)
  const currentDir = dirPath.shift()

  if( !root[currentDir] ){
    root[currentDir] = {isDir: true}
  }

  //Keep walkin'
  __setMockFile( fileName, dirPath.join(path.sep), root[currentDir] )
}

function __findNode( pathParts, tree = mockFileSystem ){
  const part = pathParts.shift()
  const subtree = tree[part]

  if( !subtree ){
    return undefined
  }

  if( pathParts.length == 0 ){ //reached the node
    return subtree
  }

  //Keep going
  return __findNode( pathParts, subtree )
}


function lstat( inputPath, cb ){

  if( inputPath[0] == path.sep ){
    inputPath = inputPath.substr(1)
  }

  const file = __findNode( inputPath.split(path.sep) )

  if( !file ){
    cb(new Error(`${inputPath} not found`))
    return
  }

  cb(null, {
    isDirectory: () => file.isDir
  })
}

function readdir( inputPath, cb ){

  if( inputPath[0] == path.sep ){
    inputPath = inputPath.substr(1)
  }

  const dir = __findNode( inputPath.split(path.sep) )
  if( !dir ){
    cb(new Error(`${inputPath} not found`))
    return
  }
  if( !dir.isDir ){
    cb(new Error(`${inputPath} not a directory`))
    return
  }

  cb(null, Object.keys(dir).filter( (n) => n != 'isDir' ))
}

fs.__setMockFile = __setMockFile
fs.readdir = readdir
fs.lstat = lstat
fs.writeFile = jest.fn()


module.exports = fs
