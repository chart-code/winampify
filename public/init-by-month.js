window.initByMonth = function(){
  console.clear()

  var sel = d3.select('.by-month').html('')

  var byMonthSel = sel.appendMany('div.month', d3.nestBy(byAlbum, d => d.date.slice(0, 7)))
  byMonthSel.append('div.month-key')
    .text(d => d.key)

  var byAlbumSel = byMonthSel.appendMany('div.album', d => _.sortBy(d, d => -d.length))
    .on('click', playSongs)
  byAlbumSel.append('div.artist').append('span').text(d => d.artist)
  byAlbumSel.append('div.album-title').append('span').text(d => d.keyStr)
  byAlbumSel.append('div.info').append('span')
    .text(d => d.length + (d.length > 1 ? ' tracks' : ' track'))
  byAlbumSel.append('div.info').append('span')
    .text(d => Math.round(d3.sum(d, e => e.songDuration)/60/1000) + ' min')




  
}

if (window.byAlbum) initByMonth()