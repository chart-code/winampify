// https://github.com/thelinmichael/spotify-web-api-node#authorization

var SpotifyWebApi = require('spotify-web-api-node')
var io = require('indian-ocean')
var child = require('child_process')

var credentialsPath = __dirname + '/credentials.json'
var credentials = io.readDataSync(credentialsPath)

var spotifyApi = new SpotifyWebApi(credentials)

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
console.log('\n')
// Wait for user's response.
var url = require('readline-sync').question('paste in url:\n\n')

var code = url.split('code=')[1].split('&')[0]


// Retrieve an access token and a refresh token
spotifyApi.authorizationCodeGrant(code).then(
  function(data) {
    console.log('The token expires in ' + data.body['expires_in'])
    console.log('The access token is ' + data.body['access_token'])
    console.log('The refresh token is ' + data.body['refresh_token'])

    // Set the access token on the API object to use it in later calls
    spotifyApi.setAccessToken(data.body['access_token'])
    spotifyApi.setRefreshToken(data.body['refresh_token'])

    credentials.access_token = data.body['access_token']
    credentials.refresh_token = data.body['refresh_token']
    credentials.code = code
    io.writeDataSync(credentialsPath, credentials, {indent: 2})
  },
  function(err) {
    console.log('Something went wrong!', err)
  }
)
