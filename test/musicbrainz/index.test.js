const Musicbrainz = require('../../musicbrainz').default
const nock = require('nock')
const musicbrainzFactory = require('../factories/musicbrainz')

const MB_HOST = 'http://musicbrainz.org'
const MB_API_PATH = '/ws/2'
const COVER_ART_ARCHIVE_HOST = 'http://coverartarchive.org'
const SEARCH_TERM_JOIN = '%20AND%20'

describe("Musicbrainz interface", () => {
  let musicbrainz
  
  beforeEach(() => {
    musicbrainz = new Musicbrainz()
  })
  
  test("DiscID calculation from CD TOC", () => {
    const TOC = "150 17998 31119 46805 60766 76445 87769 104499 125741 139399 152616 168144 185061 203355 218267 231863 250775 269308 283421 299109 334403".split(" ")

    expect( musicbrainz.computeDiscId( TOC ) ).toEqual('d_M.p37bVcYyqGi94zO5XzDVe7w-')
  })

  describe("Fetch CD data", () => {

    test("calls the discid endpoint", async () => {
      const discid = musicbrainzFactory.discid
      const mbServer = nock(MB_HOST)
        .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .get(`${MB_API_PATH}/discid/${discid}?inc=artist-credits+recordings`)
        .reply(200,{}) //, musicbrainzFactory.release
      try{
        const result = await musicbrainz.fetchCdData( discid )
      }catch(err){}
      mbServer.done()
    })

    test("queries the cover art archive to retrieve the cover picture", async () => {
      const discid = musicbrainzFactory.discid
      const mbServer = nock(MB_HOST)
        .get(`${MB_API_PATH}/discid/${discid}?inc=artist-credits+recordings`)
        .reply(200, musicbrainzFactory.release)

      const releaseId = musicbrainzFactory.releaseMbid
      const coverArtArchive = nock(COVER_ART_ARCHIVE_HOST)
        .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .get(`/release/${releaseId}/`)
        .reply(200,{})

      try{
        const result = await musicbrainz.fetchCdData( discid )
      }catch(err){}
      mbServer.done()
      coverArtArchive.done()
    })

    test("returns the expected result", async () => {
      const discid = musicbrainzFactory.discid
      const mbServer = nock(MB_HOST)
        .get(`${MB_API_PATH}/discid/${discid}?inc=artist-credits+recordings`)
        .reply(200, musicbrainzFactory.release)

      const releaseId = musicbrainzFactory.releaseMbid
      const coverArtArchive = nock(COVER_ART_ARCHIVE_HOST)
        .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .get(`/release/${releaseId}/`)
        .reply(200, musicbrainzFactory.releaseCoverArt)

      const result = await musicbrainz.fetchCdData( discid )
      mbServer.done()
      coverArtArchive.done()
      expect( result ).toEqual( musicbrainzFactory.releaseDocument )
    })

  })

  describe("Fetch release data", () => {
    test("calls the release endpoint", async () => {
      const releaseId = musicbrainzFactory.releaseMbid
      const mbServer = nock(MB_HOST)
        .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .get(`${MB_API_PATH}/release/${releaseId}?inc=artist-credits+recordings`)
        .reply(200,{}) //, musicbrainzFactory.release
      try{
        const result = await musicbrainz.fetchReleaseData( releaseId )
      }catch(err){}
      mbServer.done()
    })

    test("queries the cover art archive to retrieve the cover picture", async () => {
      const releaseId = musicbrainzFactory.releaseMbid
      const mbServer = nock(MB_HOST)
        .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .get(`${MB_API_PATH}/release/${releaseId}?inc=artist-credits+recordings`)
        .reply(200,musicbrainzFactory.release.releases[0])

      const coverArtArchive = nock(COVER_ART_ARCHIVE_HOST)
        .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .get(`/release/${releaseId}/`)
        .reply(200,{})

      try{
        const result = await musicbrainz.fetchReleaseData( releaseId )
      }catch(err){}
      mbServer.done()
      coverArtArchive.done()
    })

    test("returns the expected result", async () => {
      const releaseId = musicbrainzFactory.releaseMbid
      const mbServer = nock(MB_HOST)
        .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .get(`${MB_API_PATH}/release/${releaseId}?inc=artist-credits+recordings`)
        .reply(200,musicbrainzFactory.release.releases[0])

      const coverArtArchive = nock(COVER_ART_ARCHIVE_HOST)
        .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .get(`/release/${releaseId}/`)
        .reply(200, musicbrainzFactory.releaseCoverArt)

      const result = await musicbrainz.fetchReleaseData( releaseId )
      mbServer.done()
      coverArtArchive.done()
      expect( result ).toEqual( musicbrainzFactory.releaseDocument )
    })
  })

  describe("Find recording by name", () => {
    test("calls the release query endpoint", async () => {
      const releaseName = musicbrainzFactory.releaseDocument.title
      const tracksCount = musicbrainzFactory.releaseDocument.tracks.length
      const artist = null
      const mbServer = nock(MB_HOST)
        .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .get(`${MB_API_PATH}/release/?query=release:${encodeURIComponent(releaseName)}${SEARCH_TERM_JOIN}tracks:${tracksCount}`)
        .reply(200, musicbrainzFactory.releasesSearch)
      const result = await musicbrainz.findRecordingByName( releaseName, artist, tracksCount )
      mbServer.done()
      //No name, so the function should be a pass through
      expect( result ).toEqual( musicbrainzFactory.releasesSearch )
    })

    test("filters result based on the artist name if provided", async () => {
      const releaseName = musicbrainzFactory.releaseDocument.title
      const tracksCount = musicbrainzFactory.releaseDocument.tracks.length
      const artist = 'Chantal Goya'
      const mbServer = nock(MB_HOST)
        .defaultReplyHeaders({
          'Content-Type': 'application/json'
        })
        .get(`${MB_API_PATH}/release/?query=release:${encodeURIComponent(releaseName)}${SEARCH_TERM_JOIN}tracks:${tracksCount}`)
        .reply(200, musicbrainzFactory.releasesSearch)
      const result = await musicbrainz.findRecordingByName( releaseName, artist, tracksCount )
      mbServer.done()
      //No result matching the given artist name
      expect( result )
        .toEqual( Object.assign(
          {},
          musicbrainzFactory.releasesSearch,
          { releases:[] } )
        )
    })
  })

})
