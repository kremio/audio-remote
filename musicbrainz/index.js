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



  findRecordingByName( name, tracksCount ){
    return new Promise( (success, failure) => {
      const q = `recording/?query=recording:${encodeURIComponent(name)}%20AND%20tracks:${tracksCount}`
      console.log(q)
      this.doMusicbrainzQuery( q )
        .then( (data) => {
          /*
          console.log(data.recordings[0].title)
          console.log(data.recordings[0]['artist-credit'])
           Quality Control
[ { artist:
     { id: '11c6b106-1c1f-429d-8407-b1ee155d7f72',
       name: 'Jurassic 5',
       'sort-name': 'Jurassic 5',
       aliases: [Array] } } ]
           */
          success(data)
//          this.handleDiscIdJSON( success, failure, discid, data )
        })
        .catch( failure )
    })
  }

  async fetchCdData( TOC ){
    const discid = this.computeDiscId( TOC )

    return new Promise( (success, failure) => {
      this.doMusicbrainzQuery( `discid/${discid}?inc=artist-credits+recordings` )
        .then( (data) => {
          this.handleDiscIdJSON( success, failure, discid, data )
        })
        .catch( failure )
    })
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

  async handleDiscIdJSON( success, rej, discid, data ){
    if( !data.releases || data.releases.length == 0 ){
      rej( new Error("DiscId not found in Musicbrainz") )
      return
    }

    //Check if the cover art work is available
    const release = data.releases[0]
    let coverArt = undefined
    if( release['cover-art-archive'] && release['cover-art-archive'].count > 0){
      try{
        coverArt = await this.doCoverArtArchiveQuery(release.id)
      }catch(err){
        console.log(err)
      }
    }


    const record = {
      title: release.title,
      date: release.date,
      mbid: release.id,
      coverArt
    }
    record.tracks = release.media
      .find( (medium) => medium.discs.find( (disc) => disc.id == discid ) )
      .tracks.map( (track) => {
        const t = {
          title: track.title,
          position: track.position,
        }
        t.artists = track['artist-credit'].reduce( (acc, artist) => acc + `${artist.name} ${artist.joinphrase}` , "")
        return t
      })


    success( record )
  }
}

exports.default = Musicbrainz
