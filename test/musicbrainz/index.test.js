const Musicbrainz = require("../../musicbrainz").default

describe("Musicbrainz interface", () => {
  let musicbrainz
  
  beforeEach(() => {
    musicbrainz = new Musicbrainz()
  })
  
  test("DiscID calculation from CD TOC", () => {
    const TOC = "150 17998 31119 46805 60766 76445 87769 104499 125741 139399 152616 168144 185061 203355 218267 231863 250775 269308 283421 299109 334403".split(" ")

    expect( musicbrainz.computeDiscId( TOC ) ).toEqual('d_M.p37bVcYyqGi94zO5XzDVe7w-')
  })
})
