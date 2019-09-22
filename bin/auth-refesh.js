// https://github.com/thelinmichael/spotify-web-api-node#authorization

var SpotifyWebApi = require('spotify-web-api-node')
var io = require('indian-ocean')

var credentials = io.readDataSync(__dirname + '/credentials.json')

var spotifyApi = new SpotifyWebApi(credentials)

// Retrieve an access token and a refresh token
spotifyApi.authorizationCodeGrant(credentials.code).then(
  function(data) {
    console.log('The token expires in ' + data.body['expires_in'])
    console.log('The access token is ' + data.body['access_token'])
    console.log('The refresh token is ' + data.body['refresh_token'])

    // Set the access token on the API object to use it in later calls
    spotifyApi.setAccessToken(data.body['access_token'])
    spotifyApi.setRefreshToken(data.body['refresh_token'])
  },
  function(err) {
    console.log('Something went wrong!', err)
  }
)

spotifyApi.refreshAccessToken().then(
  function(data) {
    console.log('The access token has been refreshed!');

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);
  },
  function(err) {
    console.log('Could not refresh access token', err);
  }
);




// spotifyApi.getMe()
//   .then(function(data) {
//     console.log('Some information about the authenticated user', data.body);
//   }, function(err) {
//     console.log('Something went wrong!', err);
//   });
