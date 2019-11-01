var searchSel = d3.select('.search').html('')
  .append('input')
  .at({placeholder: 'search...'})
  .on('input', function(){
    searchSel.str = this.value.toLowerCase()
    filterAll()
  })

d3.loadData(dataPath + 'tidy.tsv', (err, res) => {
  songs = res[0]

  d3.select('#lib').st({opacity: 1})

  byArtist = d3.nestBy(songs, d => d.artistId)
  byArtist.forEach(d => {
    d.byAlbum = d3.nestBy(d, d => d.albumId)
    d.active = true
    d.keyStr = d[0].artist
  })
  byArtist = _.sortBy(byArtist, d => d.keyStr)

  byAlbum = _.flatten(byArtist.map(d => d.byAlbum))
  byAlbum.forEach(d => {
    d.active = true
    d.artist = d[0].artist
    d.date = d[0].date
    d.keyStr = d[0].album
  })
  byAlbum = _.sortBy(byAlbum, d => d.length)
  byAlbum = _.sortBy(byAlbum, d => d.date).reverse()

  songs.forEach(d => {
    d.active = d.searchActive = true
    d.searchStr = (d.artist + ' ' + d.album + ' ' + d.song + ' ' + d.date).toLowerCase()
  })

  var artistCols = [
    {str: 'Artist', ra: 0, w: 219, val: d => d.keyStr},
    {str: 'Albums', ra: 1, w: 45, val: d => d3.sum(d.byAlbum, d => d.searchActive)},
    {str: 'Tracks', ra: 1, w: 45, val: d => d3.sum(d, d => d.searchActive)},
  ]

  var albumCols = [
    {str: 'Album', ra: 0, w: 205, val: d => d.keyStr},
    {str: 'Date', ra: 0, w: 75, val: d => d.date},
    {str: 'Tracks', ra: 1, w: 45, val: d => d3.sum(d, d => d.artistActive && d.searchActive)},
  ]

  var songCols = [
    {str: 'Title', ra: 0, w: 183, val: d => d.song},
    {str: 'Artist', ra: 0, w: 219, val: d => d.artist},
    {str: 'Album', ra: 0, w: 205, val: d => d.album},
    {str: 'Date', ra: 0, w: 75, val: d => d.date},
  ]

  window.table = {
    artist: initLongScroll('#artists', byArtist, artistCols),
    album: initLongScroll('#albums', byAlbum, albumCols),
    song: initLongScroll('#songs', songs, songCols)
  }
  filterAll()

  if (token) addDeviceSelect()
})

function filterAll(){
  if (table.artist.selected && table.album.selected){
    if (table.album.selected.artist != table.artist.selected.key){
      table.album.selected = null
    }
  } 

  songs.forEach(d => {
    d.artistActive = !table.artist.selected || table.artist.selected.key == d.artistId
    d.albumActive = !table.album.selected || table.album.selected.key == d.albumId
    d.searchActive = !searchSel.str || d.searchStr.includes(searchSel.str) 

    d.active = d.artistActive && d.albumActive && d.searchActive
  })

  byAlbum.forEach(d => {
    d.searchActive = d.some(d => d.searchActive)
    d.lengthActive = searchSel.str || table.artist.selected || d.length > 3

    d.active = d.some(d => d.artistActive && d.searchActive) && d.lengthActive 
  })

  byArtist.forEach(d => {
    d.active = d.some(d => d.searchActive)
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

async function addDeviceSelect(){
  var {devices, activeDevice} = await getDevices()

  var preferedDevice = activeDevice
  try {
    preferedDevice = JSON.parse(localStorage.getItem('winampify-prefered'))
  } catch (e){}

  var preferedId = preferedDevice ? preferedDevice.id : ''
  var activeId = activeDevice ? activeDevice.id : ''
  if (preferedId != activeId && preferedId) setDevice(preferedDevice.id)

  // TODO show that the device isn't active? Or maybe music makes this obvious
  var selectSel = d3.select('#auth-button').html('')
    .append('select')
    .on('change', () => {
      var name = selectSel.parent().node().value
      var device = devices.find(d => d.name == name)
      localStorage.setItem('winampify-prefered', JSON.stringify(device))
      setDevice(device.id)
    })
    .appendMany('option', _.sortBy(devices, d => preferedId == d.id ? -1 : 0))
    .text(d => d.name)
}

// https://developer.spotify.com/documentation/web-api/reference/player/start-a-users-playback/
async function playSongs(trackList){
  var uris = trackList
    .slice(0, 100)
    .map(d => 'spotify:track:' + d.songId)

  var response = await fetch('https://api.spotify.com/v1/me/player/play', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token ,
    },
    body: JSON.stringify({uris}),
  })
  console.log(response)

  try {
    var json = await response.json()
    if (json){
      console.log(json.error)
      alert(json.error.message)
    }
  } catch (e){}
}

// https://developer.spotify.com/documentation/web-api/reference-beta/#endpoint-get-a-users-available-devices
async function getDevices(){
  var response = await fetch('https://api.spotify.com/v1/me/player/devices', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token ,
    },
  })
  console.log(response)

  var prevDevices = []
  try {
    prevDevices = JSON.parse(localStorage.getItem('winampify-devices'))
      .filter(d => d)
  } catch (e){ console.log(e) }

  try {
    var json = await response.json()
    var curDevices = json.devices || []

    var devices = d3.nestBy(curDevices.concat(prevDevices), d => d.id)
      .map(([{id, name}]) => ({id, name}))
    localStorage.setItem('winampify-devices', JSON.stringify(devices))

    return {devices, activeDevice: curDevices.find(d => d.is_active)}

  } catch (e){ console.log(e) }
}

// https://developer.spotify.com/documentation/web-api/reference-beta/#endpoint-transfer-a-users-playback
async function setDevice(id){
  if (Document.hidden) return

  var response = await fetch('https://api.spotify.com/v1/me/player', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token ,
    },
    body: JSON.stringify({device_ids: [id], play: true}),
  })

  try {
    var json = await response.json()
    if (json) console.log(json.error)
  } catch (e){}
}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}








