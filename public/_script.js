console.clear()

// d3.selectAll('.table').html('')

d3.loadData('tidy.tsv', (err, res) => {
  songs = res[0]


  byArtist = d3.nestBy(songs, d => d.artist)
  byArtist.forEach(d => d.byAlbum = d3.nestBy(d, d => d.album))
  byAlbum = _.flatten(byArtist.map(d => d.byAlbum))

  songs.forEach(d => d.active = true)
  byAlbum.forEach(d => d.active = true)

  var songCols = [
    {str: 'Title', ra: 0, w: 180, val: d => d.song},
    {str: 'Artist', ra: 0, w: 180, val: d => d.artist},
    {str: 'Album', ra: 0, w: 180, val: d => d.album},
    {str: 'Date', ra: 0, w: 75, val: d => d.date},
  ]

  artistTable = initArtistTable()
  songTable = initLongScroll(d3.select('#songs'), songs, songCols)


  function renderAll(){
    songTable.render()
  }

  renderAll()

})




function initArtistTable(){
  var sel = d3.select('#artists').html('')

  var cols = [
    {str: 'Artist', ra: 0, w: 200, val: d => d.key},
    {str: 'Albums', ra: 1, w: 80, val: d => d3.sum(d.byAlbum, d => d.active)},
    {str: 'Tracks', ra: 1, w: 80, val: d => d3.sum(d, d => d.active)},
  ]

  byArtist.forEach(artist => {
    artist.cols = cols.map(col => {
      return {col, artist}
    })
  })

  var headerSel = sel.append('div.header')
    .appendMany('div.col', cols)
    .text(d => d.str)
    .st({width: d => d.w})
    .classed('align-right', d => d.ra)
    .on('click', setSort)

  var rowSel = sel.append('div.row-container')
    .appendMany('div.row', byArtist)
    .on('click', d => {
      var prevActive = d.active
      byArtist.forEach(e => e.active = d == e)
      if (prevActive) d.active = false
      rowSel.classed('active', e => e.active)
    })

  var colSel = rowSel.appendMany('div.col', d => d.cols)
    .st({width: d => d.col.w})
    .classed('align-right', d => d.col.ra)
    .text(d => d.col.val(d.artist))


  function setSort(d){
    d.notReverse = !d.notReverse

    headerSel.classed('up', 0).classed('down', 0)
    headerSel.filter(e => e == d).classed(d.notReverse ? 'up' : 'down', 1)

    byArtist = _.sortBy(byArtist, d.val)
    if (!d.notReverse) byArtist.reverse() 

    byArtist.forEach((d, i) => d.i = i)
    rowSel.sort((a, b) => a.i - b.i)
  }
}

function initLongScroll(sel, data, cols){
  sel.html('')

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

    data.forEach((d, i) => d.i = i)

    scroll()
  }

  //https://blocks.roadtolarissa.com/jasondavies/3689677
  //https://dev.to/adamklein/build-your-own-virtual-scroll-part-i-11ib
  var contSel = sel.append('div.row-container')
    .on('scroll.longscroll', render)
  var contNode = contSel.node()

  var rowHeight = 19
  var contHeight = contSel.node().offsetHeight
  var numRows = 1 + Math.ceil(contHeight/rowHeight)
  var vData = data.slice(0, numRows) // visable data

  var currentSel = contSel
    .append('div').st({height: data.length*rowHeight})
    .append('div.current')

  var rowSel = currentSel.appendMany('div.row', d3.range(numRows))
    .on('click', function(i){
      var d = vData[i]
      if (!d) return

      var wasSelected = d.selected
      data.forEach(e => e.selected = d == e)
      if (wasSelected) d.selected = false

      render()
      rowSel

      // TODO play song?
    })

  var colSel = rowSel.appendMany('div.col', i => cols.map(col => ({col, i})))
    .st({width: d => d.col.w})
    .classed('align-right', d => d.col.ra)


  function render(){
    var position = Math.floor(contNode.scrollTop/rowHeight)
    var p0 = d3.clamp(0, position, data.length - numRows)
    var p1 = p0 + numRows
    
    vData = data.slice(p0, p1)

    currentSel.st({transform: `translateY(${p0*rowHeight}px)`})
    rowSel.classed('selected', i => vData[i] && vData[i].selected)
    colSel
      .st({opacity: d => vData[d.i] ? 1 : 0})
      .filter(d => vData[d.i])
      .text(d => d.col.val(vData[d.i]))
  }

  return {render}
}











