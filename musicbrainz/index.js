const http = require('http')
const url = require('url')
const crypto = require('crypto')

function asyncGet( request ){
  return new Promise( (success, failure) => {
    http.get( request, success )
  })
}

//Query musicbrainz.org for audio CD data
class Musicbrainz {
  constructor(){
    this.reqOpt = {
      headers: {
        accept: 'application/json',
        'user-agent': 'KSDTagger/0.0.1 ( kremio.software@gmail.com )' },
        host: 'musicbrainz.org',
    }
  }


  async handleHTTPResponse( res ){
    const { statusCode } = res
    if( (statusCode == 307 || statusCode == 302) && res.headers['location'] ){
      const location = url.parse( res.headers['location'] )
      return asyncGet( Object.assign({}, this.reqOpt, {
        host: location.host,
        path: location.pathname
      }) ).then( this.handleHTTPResponse.bind(this) )
    }

    let error
    const contentType = res.headers['content-type']

    if (statusCode !== 200){
      error = new Error(`Request Failed.\nStatus Code: ${statusCode}`);
    }else if (!/^application\/json/.test(contentType)) {
      error = new Error('Invalid content-type.\n' + `Expected application/json but received ${contentType}`)
    }

    if (error) {
      // consume response data to free up memory
      res.resume()
      throw error
    }

    return new Promise( (success, failure) => {
      res.setEncoding('utf8')
      let rawData = ''
      res.on('data', (chunk) => { rawData += chunk })
      res.on('end', () => {
        success( JSON.parse(rawData) )
      })
    })

  }

  doMusicbrainzQuery( query ){
    return asyncGet( Object.assign({}, this.reqOpt, { path: `/ws/2/${query}` }) )
      .then( this.handleHTTPResponse.bind(this) )
  }


  async doCoverArtArchiveQuery(MBID){
    return asyncGet( Object.assign({}, this.reqOpt, {
      host: 'coverartarchive.org', path: `/release/${MBID}/`
    }) )
      .then( this.handleHTTPResponse.bind(this) )
      .then( this.handleCoverArtJSON.bind(this) )

  }

  handleCoverArtJSON( data ){
    return data.images[0].image
  }

  async findRecordingByName( name, artist, tracksCount ){
    const search = {
      release: name,
      tracks: tracksCount
    }

    const q = 'release/?query=' + Object.keys(search)
      .filter( (k) => search[k] != "")
      .map( (k) => `${k}:${encodeURIComponent(search[k])}` )
      .join('%20AND%20')

    const data = await this.doMusicbrainzQuery( q )

    if( !artist || artist == "" ){ //no need to filter results further
      return data
    }

    //Filter using the artist field
    const artistRegex = new RegExp(artist, 'i');
    data.releases = data.releases.filter( (release) => {
      return release['artist-credit']
        .reduce( (acc, credit) => { //collect all the names
          acc.push( credit.artist.name )
          if(credit.artist.aliases){
            credit.artist.aliases.forEach( (alias) => acc.push(alias.name) )
          }
          return acc
        }, [])
        .find( (name) => artistRegex.test(name) )
    })

    return data
  }

  async fetchCdData( discid ){

    const data = await this.doMusicbrainzQuery( `discid/${discid}?inc=artist-credits+recordings` )

    if( !data.releases || data.releases.length == 0 ){
      throw new Error("DiscId not found in Musicbrainz")
    }

    return this.handleReleaseJSON( data.releases[0], discid )
  }

  async fetchReleaseData( releaseId ){
    const data = await this.doMusicbrainzQuery( `release/${releaseId}?inc=artist-credits+recordings` )
    return this.handleReleaseJSON( data )
  }

  computeDiscId( TOC ){
    //Extract the lead-out track LBA offset
    const leadOut = TOC.pop()
    const trackCount = TOC.length

    // Fill the array with 0s to reach 99 tracks
    while(TOC.length < 99){ TOC.push(0) }

    // Add the lead-oud track LBA offset in front of the array
    TOC.unshift( leadOut )

    // Create SHA-1 digest object
    const hash = crypto.createHash('sha1')

    TOC.reduce( (acc,d) => { // Convert TOC into hexadecimal uppercase ASCII format
      acc.push(Number(d).toString(16).padStart(8,0).toUpperCase())
      return acc
    }, [
      Number(1).toString(16).padStart(2,0).toUpperCase(), //First track number
      Number(trackCount).toString(16).padStart(2,0).toUpperCase() //Last track number
    ] )
      .forEach( (d) => hash.update(d,'ascii') ) // Update the hash


    // BASE64 encode formula for Musicbrainz
    return hash.digest() // Get the buffer holding the SHA-1 digest data
      .toString('base64') // Get its BASE64 representation
      .replace('+','.').replace('/','_').replace('=','-') // convert +, /, and = to respectively ., _, and -
  }

  async handleReleaseJSON( /*success, rej,*/ release, discid = false ){

    let coverArt = undefined
    if( release['cover-art-archive'] && release['cover-art-archive'].count > 0){
      coverArt = await this.doCoverArtArchiveQuery(release.id)
    }

    const record = {
      title: release.title,
      date: release.date,
      mbid: release.id,
      coverArt
    }

    record.tracks = release.media
      .find( (medium) => discid ? medium.discs.find( (disc) => disc.id == discid ) : true )
      .tracks.map( (track) => {
        const t = {
          title: track.title,
          position: track.position,
        }
        t.artists = track['artist-credit'].reduce( (acc, artist) => acc + `${artist.name} ${artist.joinphrase}` , "")
        return t
      })


    return record
  }
}

exports.default = Musicbrainz
