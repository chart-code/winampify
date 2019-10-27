var token = getToken()

function getToken(){
  var hash = window.location.hash
    .substring(1)
    .split('&')
    .reduce(function (initial, item) {
      if (item) {
      var parts = item.split('=')
      initial[parts[0]] = decodeURIComponent(parts[1])
      }
      return initial
    }, {})
  window.location.hash = ''

  // Set token
  var token = hash.access_token
  if (token) return token

  var authEndpoint = 'https://accounts.spotify.com/authorize'

  var clientId = '83cc6f3e727747aab0f30bd4a501308f'
  var redirectUri = window.location.href.replace('#', '')
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
  ]
  window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token&state=123`

  // Make a call using the token
  // $.ajax({
  //   url: "https://api.spotify.com/v1/me/top/artists",
  //   type: "GET",
  //   beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Bearer ' + token )},
  //   success: function(data) { 
  //     // Do something with the returned data
  //     data.items.map(function(artist) {
  //     let item = $('<li>' + artist.name + '</li>')
  //     item.appendTo($('#top-artists'))
  //     })
  //   }
  // })

}
