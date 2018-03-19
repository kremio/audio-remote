const http = require('http')

//Query musicbrainz.org for audio CD data
class Musicbrainz {
	constructor(discid){
		this.reqOpt = {
			headers: {
				accept: 'application/json',
				'user-agent': 'KSDTagger/0.0.1 ( kremio.software@gmail.com )' },
			host: 'musicbrainz.org',
		}

		this.result = new Promise( (success,rej) => {
			http.get( Object.assign({}, this.reqOpt,{ path: `/ws/2/discid/${discid}?inc=artist-credits+recordings` }), (res) => {
				const { statusCode } = res
				const contentType = res.headers['content-type']

				let error
				if (statusCode !== 200) {
					error = new Error(`Request Failed.\nStatus Code: ${statusCode}`);
				} else if (!/^application\/json/.test(contentType)) {
					error = new Error('Invalid content-type.\n' + `Expected application/json but received ${contentType}`);
				}
				if (error) {
					rej( error )
					// consume response data to free up memory
					res.resume()
					return
				}

				res.setEncoding('utf8');
				let rawData = '';
				res.on('data', (chunk) => { rawData += chunk; });
				res.on('end', () => {
					try {
						const parsedData = JSON.parse(rawData);
						this.handleDiscIdJSON( success, rej, discid, parsedData )
					} catch (e) {
						rej(e)
					}
				});
			})			
		})
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
