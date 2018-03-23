const http = require('http')
const crypto = require('crypto')

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

  fetchCdData( TOC ){
    const discid = this.computeDiscId( TOC )

    return new Promise( (success,rej) => {
      http.get( Object.assign({}, this.reqOpt,{ path: `/ws/2/discid/${discid}?inc=artist-credits+recordings` }), (res) => {
        const { statusCode } = res
        const contentType = res.headers['content-type']

        //console.log("Musicbrainz responded", res)
        let error
        if (statusCode !== 200) {
          error = new Error(`Request Failed.\nStatus Code: ${statusCode}`);
        } else if (!/^application\/json/.test(contentType)) {
          error = new Error('Invalid content-type.\n' + `Expected application/json but received ${contentType}`)
        }
        if (error) {
          rej( error )
          // consume response data to free up memory
          res.resume()
          return
        }

        res.setEncoding('utf8')
        let rawData = ''
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(rawData);
            this.handleDiscIdJSON( success, rej, discid, parsedData )
          } catch (e) {
            rej(e)
          }
        })
      })
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

  handleDiscIdJSON( success, rej, discid, data ){
    if( !data.releases || data.releases.length == 0 ){
      rej( new Error("DiscId not found in Musicbrainz") )
      return
    }

    const record = {
      title: data.releases[0].title,
      date: data.releases[0].date
    }
    record.tracks = data.releases[0].media
      .find( (medium) => medium.discs[0].id == discid )
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
