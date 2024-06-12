window.initByMonth = function(){
  console.clear()

  var sel = d3.select('.by-month').html('')

  var skipArtists = ['DJ Rashad', 'Ty Segall', 'Raffi', 'Randy Newman', 'Weather Report', 'Matthew Dear', '2 Chainz', 'Lil Durk', 'Jimi Hendrix', 'Raffi', 'Future', 'Chief Keef', 'Serengeti', 'Guided By Voices', 'John Williams', 'The Beach Boys']
  var isSkipArtist = Object.fromEntries(skipArtists.map(artist => [artist, 1]));
  byAlbum.forEach(d => {
    var title = d.keyStr.toLowerCase()
    var hasParenth = title.includes(')')

    d.duration = d3.sum(d, e => e.songDuration)/60/1000
    d.isRemix = hasParenth && title.includes('remix')
    d.isReissue = hasParenth && (title.includes('anniversary') || title.includes('issue') || title.includes('edition') || title.includes('remaster')  || title.includes('deluxe'))
    d.isLive = hasParenth && title.includes('live') || title.includes('live from')
    d.isSoundtrack = hasParenth && (title.includes('original') || title.includes('soundtrack'))
    d.isShort = d.duration < 20 && d.length < 5
    d.isSkipArtist = isSkipArtist[d.artist]
  })


  var selectedAlbums = byAlbum
    .filter(d => !d.isRemix && !d.isReissue && !d.isLive && !d.isSoundtrack && !d.isShort && !d.isSkipArtist)

  // // list artists dominating the monthly list
  // var byArtist = d3.nestBy(selectedAlbums, d => d.artist)
  // byArtist = _.sortBy(byArtist, d => d.length)
  // byArtist.slice(-60).forEach(d => console.log(d[0].artist, d.length))

  var byMonthSel = sel.appendMany('div.month', d3.nestBy(selectedAlbums, d => (d.date + '-01').slice(0, 7)))
  byMonthSel.append('div.month-key')
    .text(d => d.key)

  var byAlbumSel = byMonthSel.appendMany('div.album', d => _.sortBy(_.sortBy(d, d => -d.duration), d => -d.length))
    .on('click', playSongs)
  byAlbumSel.append('div.artist').append('span').text(d => d.artist)
  byAlbumSel.append('div.album-title').append('span').text(d => d.keyStr)
  byAlbumSel.append('div.info').append('span')
    .text(d => d.length + (d.length > 1 ? ' tracks' : ' track'))
  byAlbumSel.append('div.info').append('span')
    .text(d => Math.round(d.duration) + ' min')
}

if (window.byAlbum) initByMonth()