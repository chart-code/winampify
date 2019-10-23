// https://github.com/thelinmichael/spotify-web-api-node#authorization

var SpotifyWebApi = require('spotify-web-api-node')
var io = require('indian-ocean')
var child = require('child_process')
var readline = require('readline-sync')
var open = require('open')

module.exports = async function(){
  var credentialsPath = __dirname + '/credentials.json'
  var credentials = io.readDataSync(credentialsPath)
  var spotifyApi = new SpotifyWebApi(credentials)

  var scopes = [
    'user-modify-playback-state',
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-library-read',
    'user-follow-read',
    'user-read-recently-played',
    'user-top-read',
    'streaming',
    'app-remote-control',
  ]

  var spURL = spotifyApi.createAuthorizeURL(scopes, '123')
  console.log("opening\n" + spURL + '\n')
  open(spURL)

  // Wait for user's response.
  var rvURL = readline.question("paste in URL that you're redirected to :\n\n")
  var code = rvURL.split('code=')[1].split('&')[0]

  // Retrieve an access token and a refresh token
  var data = await spotifyApi.authorizationCodeGrant(code)
  credentials.access_token = data.body['access_token']
  credentials.refresh_token = data.body['refresh_token']
  credentials.code = code

  // TODO save each user to a seperate file?
  io.writeDataSync(credentialsPath, credentials, {indent: 2})

  return credentials
}