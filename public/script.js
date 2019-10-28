var searchSel = d3.select('.search').html('')
  .append('input')
  .at({placeholder: 'search...'})
  .on('input', function(){
    searchSel.str = this.value.toLowerCase()
    filterAll()
  })

d3.loadData(dataPath + 'tidy.tsv', (err, res) => {
  songs = res[0]

  byArtist = d3.nestBy(songs, d => d.artist)
  byArtist.forEach(d => d.byAlbum = d3.nestBy(d, d => d.album))
  byArtist.forEach(d => d.active = true)
  byArtist = _.sortBy(byArtist, d => d.key)

  byAlbum = _.flatten(byArtist.map(d => d.byAlbum))
  byAlbum.forEach(d => {
    d.active = true
    d.artist = d[0].artist
    d.date = d[0].date
    d.forEach((e, i) => e.trackNum = i)
  })
  byAlbum = _.sortBy(byAlbum, d => d.length)
  byAlbum = _.sortBy(byAlbum, d => d.date).reverse()

  songs.forEach(d => {
    d.active = d.searchActive = true
    d.searchStr = (d.artist + ' ' + d.album + ' ' + d.song).toLowerCase()
  })

  var artistCols = [
    {str: 'Artist', ra: 0, w: 200, val: d => d.key},
    {str: 'Albums', ra: 1, w: 80, val: d => d3.sum(d.byAlbum, d => d.searchActive)},
    {str: 'Tracks', ra: 1, w: 80, val: d => d3.sum(d, d => d.searchActive)},
  ]

  var albumCols = [
    {str: 'Album', ra: 0, w: 200, val: d => d.key},
    {str: 'Date', ra: 0, w: 75, val: d => d.date},
    {str: 'Tracks', ra: 1, w: 80, val: d => d3.sum(d, d => d.artistActive && d.searchActive)},
  ]

  var songCols = [
    {str: 'Title', ra: 0, w: 180, val: d => d.song},
    {str: 'Artist', ra: 0, w: 180, val: d => d.artist},
    {str: 'Album', ra: 0, w: 180, val: d => d.album},
    {str: 'Date', ra: 0, w: 75, val: d => d.date},
  ]

  window.table = {
    artist: initLongScroll('#artists', byArtist, artistCols),
    album: initLongScroll('#albums', byAlbum, albumCols),
    song: initLongScroll('#songs', songs, songCols)
  }
  filterAll()
})

function filterAll(){
  if (table.artist.selected && table.album.selected){
    if (table.album.selected.artist != table.artist.selected.key){
      table.album.selected = null
    }
  } 

  songs.forEach(d => {
    d.artistActive = !table.artist.selected || table.artist.selected.key == d.artist
    d.albumActive = !table.album.selected || table.album.selected.key == d.album
    d.searchActive = !searchSel.str || d.searchStr.includes(searchSel.str) 

    d.active = d.artistActive && d.albumActive && d.searchActive
  })

  byAlbum.forEach(d => {
    d.searchActive = d.some(d => d.searchActive)
    d.active = d.some(d => d.artistActive && d.searchActive) 
  })

  d3.values(table).forEach(d => d.updateActive())
}


function initLongScroll(selId, data, cols){
  var sel = d3.select(selId).html('')
  var aData = data.slice() // active data
  var rv = {selId, render, updateActive}

  function addHeader(){
    var headerSel = sel.append('div.table-header')
      .appendMany('div.col', cols)
      .text(d => d.str)
      .st({width: d => d.w})
      .classed('align-right', d => d.ra)
      .on('click', setSort)

    function setSort(d){
      d.notReverse = !d.notReverse

      headerSel.classed('up', 0).classed('down', 0)
      headerSel.filter(e => e == d).classed(d.notReverse ? 'up' : 'down', 1)

      data = _.sortBy(data, d.val)
      if (!d.notReverse) data.reverse() 

      updateActive()
    }
  }
  addHeader()

  //https://blocks.roadtolarissa.com/jasondavies/3689677
  //https://dev.to/adamklein/build-your-own-virtual-scroll-part-i-11ib
  var contSel = sel.append('div.row-container')
    .on('scroll.longscroll', render)
  var contNode = contSel.node()

  var rowHeight = 17
  var contHeight = contSel.node().offsetHeight
  var numRows = 5 + Math.ceil(contHeight/rowHeight)
  var vData = aData.slice(0, numRows) // visable data

  var paneSel = contSel
    .append('div').st({height: data.length*rowHeight})
  var currentSel = paneSel.append('div')

  var rowSel = currentSel.appendMany('div.row', d3.range(numRows))
    .on('click', function(i){
      var d = vData[i]
      if (!d) return
      rv.selected = rv.selected != d ? d : null
      filterAll()

      if (selId != '#songs') return
      
      playSongs(aData.slice(i + p0))     
    })

  var colSel = rowSel.appendMany('div.col', i => cols.map(col => ({col, i})))
    .st({width: d => d.col.w})
    .classed('align-right', d => d.col.ra)

  function updateActive(){
    aData = data.filter(d => d.active)
    paneSel.st({height: rowHeight*aData.length + 'px'})
    render()    
  }

  var p0 = 0
  var p1 = 0
  function render(){
    var position = Math.floor(contNode.scrollTop/rowHeight)
    p0 = d3.clamp(0, position, data.length - numRows)
    p1 = p0 + numRows
    
    vData = aData.slice(p0, p1)

    var yPx = d3.clamp(0, p0*rowHeight, rowHeight*aData.length - contHeight)
    currentSel.st({transform: `translateY(${yPx}px)`})
    rowSel
      .classed('selected', i => vData[i] == rv.selected)
      .classed('hidden', i => !vData[i])
    colSel
      .filter(d => vData[d.i])
      .text(d => d.col.val(vData[d.i]))
  }

  return rv
}



// https://developer.spotify.com/documentation/web-api/reference/player/start-a-users-playback/
async function playSongs(trackList){
  var uris = trackList
    .slice(0, 100)
    .map(d => 'spotify:track:' + d.songId)

  const response = await fetch('https://api.spotify.com/v1/me/player/play', {
    method: 'PUT',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token ,
    },
    referrer: 'no-referrer', 
    body: JSON.stringify({uris}),
  })
  console.log(response)
  try {
    var json = await response.json()
    console.log(json)
  } catch (e){

  }
}









