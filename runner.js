var player;
var next;
window.onSpotifyWebPlaybackSDKReady = () => {
    const token = '';
    player = new Spotify.Player({
        name: 'WOW spotify api',
        getOAuthToken: cb => { cb(token); }
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => { console.error(message); });
    player.addListener('authentication_error', ({ message }) => { console.error(message); });
    player.addListener('account_error', ({ message }) => { console.error(message); });
    player.addListener('playback_error', ({ message }) => { console.error(message); });

    // Playback status updates
    player.addListener('player_state_changed', ({
        position,
        duration,
        track_window: { current_track, next_tracks }
      }) => {
          $('#currentSong').text(current_track.name + "  on album  " + current_track.album.name);
          $('#nextSong').text(next_tracks[0].name + "  on album  " + next_tracks[0].album.name);
          next = next_tracks

      });

    // Ready
    player.addListener('ready', ({ device_id }) => {
        console.log('Ready with Device ID', device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player!
    player.connect();
    console.log(player);
    
    $.ajax({
        type: "GET",
        url: "https://api.spotify.com/v1/me",
        dataType: 'json',
        headers: {
            "Authorization": ""
        },
        success: function (data, status){
            console.log(data); 
            $('#username').text(data.id);
        }
    });
};



$('#volume').mousemove(function(){
    player.setVolume($('#volume').val() / 100);
});

$('#play').click(function(){
    player.resume();
})

$('#pause').click(function(){
    player.pause();
})

$('#data').click(function(){
    player.getCurrentState().then(state => {
        if (!state) {
          console.error('User is not playing music through the Web Playback SDK');
          return;
        }
      
        let {
          current_track,
          next_tracks: [next_track]
        } = state.track_window;
      
        console.log('Currently Playing', current_track);
        console.log('Playing Next', next_track);
      });

});
