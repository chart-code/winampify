var SpotifyWebApi = require('spotify-web-api-node')
var io = require('indian-ocean')

var sp
var credentials = io.readDataSync(__dirname + '/credentials.json')

async function init(){
  if (!credentials.code) credentials = await require('./auth')()
  sp = new SpotifyWebApi(credentials)

  var refreshData = await sp.refreshAccessToken()
  sp.setAccessToken(refreshData.body['access_token'])

  var meData = (await sp.getMe()).body
  // console.log(meData)

  // var limit = 50
  // var offset = 0
  var savedTracks = await sp.getMySavedTracks()
  var artistId = savedTracks.body.items[0].track.artists[0].id
  console.log({artistId})

  var albums = await sp.getArtistAlbums(artistId)
  // console.log(albums.body.items)
  var albumId = albums.body.items[0].id
  console.log({albumId})

  var album = await sp.getAlbumTracks(albumId)
  console.log(album.body)


  // fmt
  // artist, album, albumID, album date, song title, song ID
  // 



  // var allPages = await getAllPages(sp.getMySavedTracks)
  // console.log(allPages.length)
}


async function getAllPages(fn, id){
  var pages = []
  var opts = {offset: 0, limit: 50}

  do{
    var lastPage = (await fn.apply(sp, id ? [id, opts] : [opts])).body

    pages = pages.concat(lastPage.items)
    opts.offset += opts.limit
  } while (lastPage.next)

  return pages
}




init()









