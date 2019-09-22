// https://github.com/thelinmichael/spotify-web-api-node#authorization

var SpotifyWebApi = require('spotify-web-api-node')
var io = require('indian-ocean')
var child = require('child_process')

var spotifyApi = new SpotifyWebApi(io.readDataSync(__dirname + '/credentials.json'))

var scopes = [
  // 'playlist-read-collaborative',
  // 'playlist-modify-private',
  // 'playlist-modify-public',
  // 'playlist-read-private',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'user-read-playback-state',
  // 'user-read-private',
  // 'user-read-email',
  // 'user-library-modify',
  'user-library-read',
  // 'user-follow-modify',
  'user-follow-read',
  'user-read-recently-played',
  'user-top-read',
  'streaming',
  'app-remote-control',
]
 
console.log(spotifyApi.createAuthorizeURL(scopes, '123'))



