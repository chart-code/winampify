var SpotifyWebApi = require('spotify-web-api-node')
var io = require('indian-ocean')
var d3 = require('d3')
var jp = require('d3-jetpack')
var fs = require('fs')
var _ = require('underscore')

var sp
var credentials = io.readDataSync(__dirname + '/credentials.json')

var cachedAlbums = io.readdirFilterSync(__dirname + '/album-cache')
var isCached = {}
cachedAlbums.forEach(d => isCached[d.replace('.tsv', '')] = true)

var tidyPath = __dirname + '/../public/tidy.tsv'
processTidy(io.readDataSync(tidyPath.replace('tidy', 'tidy-raw')))

// init()

async function init(){
  if (!credentials.code) credentials = await require('./auth')
  sp = new SpotifyWebApi(credentials)

  var refreshData = await sp.refreshAccessToken()
  console.log('The token expires in ' + refreshData.body['expires_in']);

  var access_token = refreshData.body['access_token']
  sp.setAccessToken(access_token)
  credentials.access_token = access_token

  var loginCode = credentials.login_code || credentials.code.split('_')[0]
  io.writeDataSync(`${__dirname}/../public/codes/${loginCode}.json`, credentials)

  console.log(`starting http://localhost:3989/public/#code=${loginCode}`)

  // only update song list every four hours
  var tidyUpdated = new Date(fs.statSync(tidyPath).mtime)
  // if (new Date() - tidyUpdated < 1000*60*60*6) return console.log('Skipping udpate')

  try {
    await generateTidy() 
    console.log(`done http://localhost:3989/public/#code=${loginCode}`)
  } catch (e){ console.log(e) }

}

async function generateTidy(){
  try {
    var tidy = []

    var artists = (await dlAll(sp.getMySavedTracks))
      .map(d => d.track.artists[0])
      .filter(d => d.id != '5aIqB5nVVvmFsvSdExz408') // dump bach
      .map(d => ({artist: d.name, artistId: d.id}))

    var uniqueArtists = jp.nestBy(artists, d => d.artistId).map(d => d[0])

    for ({artist, artistId} of uniqueArtists){
      console.log(artist)
      var albums = (await dlAll(sp.getArtistAlbums, artistId))
        .map(d => ({album: d.name, date: d.release_date, albumId: d.id}))
      

      for ({album, albumId, date} of albums){
        var albumTidy = []
        var cachePath = `${__dirname}/album-cache/${albumId}.tsv`

        if (isCached[albumId]){
          albumTidy = io.readDataSync(cachePath)
        } else {
          var songs = (await dlAll(sp.getAlbumTracks, albumId))
            .map(d => ({song: d.name, songId: d.id}))
          
          songs.forEach(({song, songId}) => {
            albumTidy.push({artist, artistId, album, albumId, date, song, songId})
          })
  
          io.writeDataSync(cachePath, albumTidy)
        }

        tidy.push(...albumTidy)
      }
    }
  } catch (e){
    console.log(e)
  }

  io.writeDataSync(tidyPath.replace('tidy', 'tidy-raw'), tidy)

  processTidy(tidy)
}

function processTidy(tidy){
  // remove duplicated albums
  jp.nestBy(tidy, d => [d.artistId, d.album.toLowerCase()]).forEach(album => {
    var byAlbumId = _.sortBy(jp.nestBy(album, d => d.albumId), d => d.length)
    byAlbumId.slice(1).forEach(id => id.forEach(d => d.remove = true))
  })
  tidy = tidy.filter(d => !d.remove)

  jp.nestBy(tidy, d => d.albumId).forEach(album => {
    album.forEach((d, i) => d.trackNum = i + 1)
  })
  tidy = _.sortBy(tidy, d => -d.trackNum)
  tidy = _.sortBy(tidy, d => d.album)
  tidy = _.sortBy(tidy, d => d.date).reverse()

  io.writeDataSync(tidyPath, tidy)
}

async function dlAll(fn, id){
  var pages = []
  var opts = {offset: 0, limit: 50, country: 'US', include_groups: 'album,single'}

  do{
    var lastPage = (await fn.apply(sp, id ? [id, opts] : [opts])).body

    // enough to avoid rate limit? this issues suggests 10/s
    // https://github.com/thelinmichael/spotify-web-api-node/pull/218
    // could also retry after rate limited 
    // https://github.com/thelinmichael/spotify-web-api-node/issues/217
    await sleep(200) 

    pages = pages.concat(lastPage.items)
    opts.offset += opts.limit
  } while (lastPage.next && fn != sp.getArtistAlbums) // disable paging on artists albums; bach has too many!

  return pages
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}












