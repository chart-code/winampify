console.clear()

// d3.selectAll('.table').html('')

d3.loadData('tidy.tsv', (err, res) => {
  songs = res[0]


  byArtist = d3.nestBy(songs, d => d.artist)
  byArtist.forEach(d => d.byAlbum = d3.nestBy(d, d => d.album))
  byAlbum = _.flatten(byArtist.map(d => d.byAlbum))

  songs.forEach(d => d.active = d.searchActive = true)
  byAlbum.forEach(d => d.active = true)
  byArtist.forEach(d => d.active = true)

  var artistCols = [
    {str: 'Artist', ra: 0, w: 200, val: d => d.key},
    {str: 'Albums', ra: 1, w: 80, val: d => d3.sum(d.byAlbum, d => d.active)},
    {str: 'Tracks', ra: 1, w: 80, val: d => d3.sum(d, d => d.searchActive)},
  ]

  var albumCols = [
    {str: 'Album', ra: 0, w: 200, val: d => d.key},
    {str: 'Date', ra: 0, w: 75, val: d => d[0].date},
    {str: 'Tracks', ra: 1, w: 80, val: d => d3.sum(d, d => d.searchActive)},
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
  d3.values(table).forEach(d => d.render())

})

function filterAll(){
  songs.forEach(d => {
    var isArtist = !table.artist.selected || table.artist.selected.key == d.artist
    var isAlbum = true
    d.searchActive = true

    d.active = isArtist && isAlbum && d.searchActive
  })

  d3.values(table).forEach(d => d.updateActive())
}


function initLongScroll(selId, data, cols){
  var sel = d3.select(selId).html('')
  var aData = data.slice() // active data
  var rv = {selId, render, updateActive}

  function addHeader(){
    var headerSel = sel.append('div.header')
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

  var rowHeight = 19
  var contHeight = contSel.node().offsetHeight
  var numRows = 1 + Math.ceil(contHeight/rowHeight)
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
      // TODO play song?
    })

  var colSel = rowSel.appendMany('div.col', i => cols.map(col => ({col, i})))
    .st({width: d => d.col.w})
    .classed('align-right', d => d.col.ra)

  function updateActive(){
    aData = data.filter(d => d.active)
    paneSel.st({height: rowHeight*aData.length + 'px'})
    render()    
  }

  function render(){
    var position = Math.floor(contNode.scrollTop/rowHeight)
    var p0 = d3.clamp(0, position, data.length - numRows)
    var p1 = p0 + numRows
    
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











