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
    {str: 'Year', ra: 1, w: 46, val: d => d.year},
  ]

  artistTable = initArtistTable()
  songTable = initLongScroll(d3.select('#songs'), songs, songCols)
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

  data = data.slice(0, 1000)

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

    byArtist = _.sortBy(byArtist, d.val)
    if (!d.notReverse) byArtist.reverse() 

    byArtist.forEach((d, i) => d.i = i)
  }


  //https://blocks.roadtolarissa.com/jasondavies/3689677
  //https://dev.to/adamklein/build-your-own-virtual-scroll-part-i-11ib
  var contSel = sel.append('div.row-container')
  var contNode = contSel.node()

  var rowHeight = 30
  var contHeight = contSel.node().offsetHeight

  var beforeSel = contSel.append('div.before')
  var currentSel = contSel
    .append('div').st({height: data.length*rowHeight})
    .append('div.current')
  var afterSel = contSel.append('div.after')


  contSel.on('scroll.longscroll', scroll)

  function scroll(scrollTop){
    var position = Math.floor(contNode.scrollTop/rowHeight)
    var rows = 1 + Math.ceil(contHeight/rowHeight)
    var p0 = d3.clamp(0, position, data.length - rows)
    var p1 = p0 + rows

    // beforeSel.st({height: p0*rowHeight})
    // afterSel.st({height: (data.length - p0)*rowHeight})
    currentSel.st({transform: `translateY(${p0*rowHeight}px)`})
    var rowSel = currentSel.selectAll('.row')
      .data(d3.range(p0, p1))

    rowSel.enter().append('div.row')
      .text(d => d)
      .st({height: rowHeight, fontSize: 12})
    rowSel.exit().remove()
    rowSel.order().text(d => d)
  }

  scroll(0)

}


d3.longscroll = function() {
  var render = null,
      size = 0,
      position = 0,
      rowHeight = 20;

  function longscroll(g) {
    g.selectAll("div.before").data([0]).enter().append("div").attr("class", "before");
    var current = g.selectAll("div.current").data([0]);
    current.enter().append("div").attr("class", "current");
    g.selectAll("div.after").data([0]).enter().append("div").attr("class", "after");

    g.on("scroll.longscroll", function() {
      position = Math.floor(this.scrollTop / rowHeight);
      scroll(this.scrollTop);
    });

    scroll(0);
    // g.each(function() {
    //   var g = d3.select(this);
    //   g.property("scrollTop", +g.select(".before").style("height").replace("px", ""));
    // });

    function scroll(scrollTop) {
      g.each(function() {
        this.scrollTop = scrollTop;
        var g = d3.select(this),
            rows = 1 + Math.ceil(this.clientHeight / rowHeight),
            position0 = Math.max(0, Math.min(size - rows, position)),
            position1 = position0 + rows;

        g.select(".before").style("height", position0 * rowHeight + "px");
        g.select(".after").style("height", (size - position1) * rowHeight + "px");

        var div = g.select(".current").selectAll("div.row")
            .data(d3.range(position0, Math.min(position1, size)), String);
        div.enter().append("div")
            .attr("class", "row");
        div.exit().remove();
        div.order().call(render);
      });
    }
  }

}








