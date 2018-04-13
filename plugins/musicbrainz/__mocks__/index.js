const factory = require('../../../test/factories/musicbrainz')

exports.default = class Musicbrainz {
  computeDiscId( TOC ){
    return TOC[0] ? factory.discid : false
  }

  async fetchCdData( discid ){
    if( !discid ){
      throw new Error( 'Musicbrainz mock error' )
    }
    return Object.assign({},factory.releaseDocument)
  }

  async fetchReleaseData( recordingId ){
    if( !recordingId ){
      throw new Error( 'Musicbrainz mock error' )
    }
    return Object.assign({},factory.releaseDocument)
  }

  async findRecordingByName( title, artist, tracksCount ){
    return {title, artist, tracksCount}
  }
}
