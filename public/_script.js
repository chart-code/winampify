

// d3.selectAll('.table').html('')

d3.loadData('tidy.tsv', (err, res) => {
  songs = res[0]


  byArtist = d3.nestBy(songs, d => d.artist)
  byArtist.forEach(d => d.byAlbum = d3.nestBy(d, d => d.album))
  byAlbum = _.flatten(byArtist.map(d => d.byAlbum))

  songs.forEach(d => d.active = true)
  byAlbum.forEach(d => d.active = true)

  artistTable = initArtistTable()

})


function renderAll(){

}


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