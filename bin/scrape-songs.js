var SpotifyWebApi = require('spotify-web-api-node')
var io = require('indian-ocean')
var d3 = require('d3')
var jp = require('d3-jetpack')

var sp
var credentials = io.readDataSync(__dirname + '/credentials.json')

init()

async function init(){
  if (!credentials.code) credentials = await require('./auth')()
  sp = new SpotifyWebApi(credentials)

  var refreshData = await sp.refreshAccessToken()
  sp.setAccessToken(refreshData.body['access_token'])

  try { generateTidy() } catch (e){ console.log(e) }
}

async function generateTidy(){
  var tidy = []

  var artists = (await dlAll(sp.getMySavedTracks))
    .map(d => d.track.artists[0])
    .map(d => ({artist: d.name, artistId: d.id}))

  var uniqueArtists = jp.nestBy(artists, d => d.artistId).map(d => d[0])

  await uniqueArtists.forEach(async ({artist, artistId}, i) => {
    if (i > 4) return

    var albums = (await dlAll(sp.getArtistAlbums, artistId))
      .map(d => ({album: d.name, date: d.release_date, albumId: d.id}))

    await albums.forEach(async ({album, albumId, date}) => {
      var songs = (await dlAll(sp.getAlbumTracks, albumId))
        .map(d => ({song: d.name, songId: d.id}))

      songs.forEach(({song, songId}) => {
        tidy.push({artist, artistId, album, albumId, date, song, songId})
      })
    })  
  })


  io.writeDataSync(__dirname + '/../public/tidy.tsv', tidy)
}

async function apiPlayground(){
  var meData = (await sp.getMe()).body
  // console.log(meData)
  var savedTracks = await sp.getMySavedTracks()
  var artistId = savedTracks.body.items[0].track.artists[0].id
  console.log({artistId})

  var albums = await sp.getArtistAlbums(artistId)
  // console.log(albums.body.items)
  var albumId = albums.body.items[0].id
  console.log({albumId})

  var album = await sp.getAlbumTracks(albumId)
  console.log(album.body)
}

async function dlAll(fn, id){
  var pages = []
  var opts = {offset: 0, limit: 50}

  do{
    var lastPage = (await fn.apply(sp, id ? [id, opts] : [opts])).body

    pages = pages.concat(lastPage.items)
    opts.offset += opts.limit
  } while (lastPage.next && 0) // disable paging for faster dev

  return pages
}














