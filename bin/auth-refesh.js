var SpotifyWebApi = require('spotify-web-api-node')
var io = require('indian-ocean')

var credentials = io.readDataSync(__dirname + '/credentials.json')
var sp = new SpotifyWebApi(credentials)


async function init(){
  var refreshData = await sp.refreshAccessToken()
  sp.setAccessToken(refreshData.body['access_token'])

  var meData = (await sp.getMe()).body
  // console.log(meData)

  // var limit = 50
  // var offset = 0
  // var savedTracks = await sp.getMySavedTracks({limit, offset})
  // console.log(savedTracks.body.items)

  // console.log(savedTracks.body.items[0])
  // console.log(savedTracks.body.items[0].track)

  var allPages = await getAllPages(sp.getMySavedTracks)
  console.log(allPages.length)
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









