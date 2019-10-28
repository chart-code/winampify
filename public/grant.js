setToken()

function setToken(){
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
  // window.location.hash = ''


  if (hash.code){
    if (window.__interval) __interval.stop()
    window.__interval = d3.interval(async () => {
      d3.json(`codes/${hash.code}.json`, (err, res) => {
        window.token = res.access_token
      })
    }, 1000*60*10)

    return
  }

  // set token
  window.token = hash.access_token
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

  d3.select('#auth-button').html('')
    .append('div')
    .text('Authenticate With Spotify')
    .on('click', () => {
      window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join('%20')}&response_type=token&state=123`
    })

    console.log("hi")
  

}