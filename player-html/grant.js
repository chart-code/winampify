// Get the hash of the url
var hash = window.location.hash
.substring(1)
.split('&')
.reduce(function (initial, item) {
  if (item) {
    var parts = item.split('=');
    initial[parts[0]] = decodeURIComponent(parts[1]);
  }
  return initial;
}, {});
window.location.hash = '';

// Set token
let _token = hash.access_token;

var authEndpoint = 'https://accounts.spotify.com/authorize';

// Replace with your app's client ID, redirect URI and desired scopes
console.log(window.location.href)

var clientId = '83cc6f3e727747aab0f30bd4a501308f';
var redirectUri = window.location.href;
var scopes = [
    'user-top-read',
    'streaming',
    'playlist-read-private',
    'user-read-private',
    'user-library-read',
    'user-follow-read',
    'user-follow-modify',
    'user-top-read',
    'user-modify-playback-state'
];

// If there is no token, redirect to Spotify authorization
if (!_token) {
    window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token&show_dialog=true`;
}

// Make a call using the token
$.ajax({
    url: "https://api.spotify.com/v1/me/top/artists",
    type: "GET",
    beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer ' + _token );},
    success: function(data) { 
        // Do something with the returned data
        data.items.map(function(artist) {
        let item = $('<li>' + artist.name + '</li>');
        item.appendTo($('#top-artists'));
        });
    }
});
