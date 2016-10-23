/*jshint
  esversion: 6,
  node: true
*/

module.exports = function(Vue){
  let store = require('../lib/store')
  let ytPlayer
  let window = store.window()

  let data = {
    requestQueue: [],
    streamerQueue: [],
    currentSong: {
      id: 'vxIOUJ7by6U',
      title: 'Electric Daisy Violin - Lindsey Stirling',
    },
    currentTime: '00:00',
    duration: '00:00',
    streamerInput: '',
    requestInput: '',
    blockScrub: false,
    blockVol: false,
  }

  store.getItem('streamerQueue', (err, res) => {
    if (err) console.error(err)
    else if (res) data.streamerQueue = res
  })

  store.on('command:songrequest', res => {
    addSongRequest(res.text, res.username)
  })

  function saveQueue() {
    store.setItem('streamerQueue', data.streamerQueue, err => {
      if (err) console.error(err)
    })
  }

  window.requestAnimationFrame(songStateChecker)
  function songStateChecker() {
    try {
      // unstarted: -1, ended: 0, playing: 1, paused: 2, buffering: 3, cued: 5
      const state = ytPlayer.getPlayerState()
      if (state === -1 || state === 0) nextSong()

      const currentTime = ytPlayer.getCurrentTime()
      const duration = ytPlayer.getDuration()
      data.currentTime = secondsToMinutes(currentTime)
      data.duration = secondsToMinutes(duration)

      if (!data.blockScrub) {
        const scrubWidth = (currentTime / duration) * window.document.getElementById('scrubContainer').clientWidth
        window.document.getElementById('scrub').style.width = scrubWidth + 'px'
      }

      if (!data.blockVol) {
        const volWidth = ytPlayer.getVolume() * 0.01 * window.document.getElementById('volumeContainer').clientWidth
        window.document.getElementById('volume').style.width = volWidth + 'px'
      }

    } catch (e) {}
    window.requestAnimationFrame(songStateChecker)
  }

  function secondsToMinutes(totalSeconds) {
    const minutes = (totalSeconds / 60)|0
    const seconds = (totalSeconds % 60)|0
    let leadingMinutesZero = ''
    if (minutes < 10) leadingMinutesZero = '0'
    let leadingSecondsZero = ''
    if (seconds < 10) leadingSecondsZero = '0'
    return leadingMinutesZero + minutes + ':' + leadingSecondsZero + seconds
  }

  function getYoutubeTitle(id, fn) {
    let url = 'https://www.youtube.com/embed/' + id
    fetch(url).then(res => res.text()).then(res => {
      let title = res.split('<title>')[1].split('</title>')[0]
      if (title.includes(' - YouTube')) {
        fn(title.split(' - YouTube')[0])
      }
      else fn(false)
    })
  }

  function sanitizeYT(url) {
    // youtube.com/attribution_link?a=JZ6nOJ4SvBc&u=/watch%3Fv%3D[id]%26feature%3Dem-share_video_user
    if (url.includes('u=')) {
      const queries = url.split('?')[1].split('&')
      for (let i = 0; i < queries.length; i++) {
        const query = queries[i].split('=')
        if (query[0] == 'u') return decodeURIComponent(query[1]).split('v=')[1].substring(0,11)
      }
    }
    // youtube.com/watch?v=[id]&t=1m1s, attribution_link continued
    else if (url.includes('v=')) return url.split('v=')[1].substring(0,11)
    // youtu.be/[id]?t=1m1s, youtube.com/v/[id], youtube.com/embed/[id]?autoplay=1
    else {
      const splitURL = url.split('/')
      const output = splitURL[splitURL.length-1].split('?')[0]
      if (output.length == 11) return output
      return false
    }
  }

  let tapicStreamer = require('../lib/tapic-streamer.js')
  tapicStreamer.listen('join', initMusic)
  function initMusic(name) {
    if (name !== tapicStreamer.getUsername()) return ''

    window.document.getElementById('ytPlayer').src = 'http://localhost:3001/yt.html'

    setPlayer()
    function setPlayer() {
      ytPlayer = window.document.getElementById('ytPlayer').contentWindow.ytPlayer
      if (ytPlayer == undefined) {
        setTimeout(setPlayer, 50)
      }
      else {
        ytPlayer.addEventListener('onError', e => {
          console.log(`Youtube error ${e.data}`)
        })
      }
    }

    let $vc = window.document.getElementById('volumeContainer')
    $vc.addEventListener('mousedown', e => {
      $vc.addEventListener('mousemove', volmove)
    })
    $vc.addEventListener('mouseup', e => {
      $vc.removeEventListener('mousemove', volmove)
      data.blockVol = false
      const pixelsFromLeft = e.pageX - $vc.offsetLeft
      const containerWidth = $vc.clientWidth
      const vol = Math.round( (pixelsFromLeft/containerWidth*100) )
      ytPlayer.setVolume(vol)
    })
    $vc.addEventListener('mouseleave', e => {
      data.blockVol = false
      $vc.removeEventListener('mousemove', volmove)
    })
    function volmove(e) {
      data.blockVol = true
      const pixelsFromLeft = e.pageX - $vc.offsetLeft
      window.requestAnimationFrame(() => {
        window.document.getElementById('volume').style.width = pixelsFromLeft + 'px'
      })
    }

    let $sc = window.document.getElementById('scrubContainer')
    $sc.addEventListener('mousedown', e => {
      $sc.addEventListener('mousemove', scrubmove)
    })
    $sc.addEventListener('mouseup', e => {
      $sc.removeEventListener('mousemove', scrubmove)
      data.blockScrub = false
      const pixelsFromLeft = e.pageX - $sc.offsetLeft
      const containerWidth = $sc.clientWidth
      const scrubTimePercent = Math.round( (pixelsFromLeft/containerWidth*100) ) * 0.01
      const scrubTime = (scrubTimePercent * ytPlayer.getDuration())|0
      ytPlayer.seekTo(scrubTime, true)
    })
    $sc.addEventListener('mouseleave', e => {
      data.blockScrub = false
      $sc.removeEventListener('mousemove', scrubmove)
    })
    function scrubmove(e) {
      data.blockScrub = true
      const pixelsFromLeft = e.pageX - $sc.offsetLeft
      window.requestAnimationFrame(() => {
        window.document.getElementById('scrub').style.width = pixelsFromLeft + 'px'
      })
    }
  }

  function nextSong() {
    data.currentSong = ''
    if (data.requestQueue.length > 0) {
      let tempSong = data.requestQueue.shift()
      ytPlayer.loadVideoById(tempSong.id, 0, 'medium')
      ytPlayer.playVideo()
      data.currentSong = tempSong
      // fs.writeFile( `${execPath}txt/song-current.txt`, currentSong.title );
    }
    else if (data.streamerQueue.length > 0) {
      let tempSong = data.streamerQueue.shift()
      ytPlayer.loadVideoById(tempSong.id, 0, 'medium')
      ytPlayer.playVideo()
      data.currentSong = tempSong
      data.streamerQueue.push(tempSong)
      saveQueue()
      // fs.writeFile( `${execPath}txt/song-current.txt`, currentSong.title );
    }
  }
  function prevSong() {
    ytPlayer.seekTo(0, true)
  }

  function addSongStreamer(videoid) {
    // allows most copy-pastes to work
    if ( videoid.length != 11 ) {
      videoid = sanitizeYT(videoid)
      if (!videoid) return '' // not a good url
    }

    // check if it's already in there
    let found = false
    for (let i = 0; i < data.streamerQueue.length; i++) {
      if (data.streamerQueue[i].id === videoid) {
        found = true
        break
      }
    }
    if (found) {
      // TODO some message
      return ''
    }

    getYoutubeTitle(videoid, function (title) {
      if (!title) return '' // no video found
      let pushObj = {
        id: videoid,
        title: title,
      }
      data.streamerQueue.push(pushObj)
      // log( `* "${videotitle}" added to the streamer song queue.` );

      saveQueue()

      // If after adding a song, the player isn't playing, start it
      let state = ytPlayer.getPlayerState()
      if (state !== 1 && state !== 2) nextSong()
    })
  }

  function addSongRequest(videoid, username) {
    // allows most copy-pastes to work
    if ( videoid.length != 11 ) {
      videoid = sanitizeYT(videoid)
      if (!videoid) return '' // not a good url
    }

    // check if it's already in there
    let found = false
    for (let i = 0; i < data.requestQueue.length; i++) {
      if (data.requestQueue[i].id === videoid) {
        found = true
        break
      }
    }
    if (found) {
      // TODO some message
      return ''
    }

    getYoutubeTitle(videoid, function (title) {
      if (!title) return '' // no video found
      let pushObj = {
        id: videoid,
        title: title,
        user: username,
      }
      data.requestQueue.push(pushObj)
      // cmdSay( `"${videotitle}" added to the queue by ${username}` );

      // If after adding a song, the player isn't playing, start it
      let state = ytPlayer.getPlayerState()
      if (state !== 1 && state !== 2) nextSong()
    })
  }

  function toggleMute() {
    if (ytPlayer.isMuted()) {
      ytPlayer.unMute()
    } else {
      ytPlayer.mute()
    }
  }

  // Fisher-Yates shuffle
  function shuffle(inputArray) {
    let array = JSON.parse(JSON.stringify(inputArray))
  	const len = array.length
  	for (let i = 0; i < len-2; i++) {
    	const select = i + (Math.random() * (len - i))|0
      const swap = array[i]
      array[i] = array[select]
      array[select] = swap
    }
    return array
  }

  Vue.component('music', {
    template: require('pug').renderFile('./view/music.pug'),
    data: function () { return data },
    methods: {
      nextSong: function () {
        nextSong()
      },
      prevSong: function () {
        prevSong()
      },
      shuffleStreamer: function () {
      	this.streamerQueue = shuffle(this.streamerQueue)
        saveQueue()
      },
      shuffleRequest: function () {
      	this.requestQueue = shuffle(this.requestQueue)
      },
      addStreamer: function () {
        addSongStreamer(this.streamerInput)
        this.streamerInput = ''
      },
      addRequest: function () {
        addSongRequest(this.requestInput, tapicStreamer.getDisplayName())
        this.requestInput = ''
      },
      favorite: function () {
        addSongStreamer(this.currentSong.id)
      },
      removeRequest: function (id) {
        for (let i = 0; i < this.requestQueue.length; i++) {
          if (this.requestQueue[i].id === id) {
            this.requestQueue.splice(i, 1)
            break
          }
        }
      },
      removeStreamer: function (id) {
        let tempQueue = JSON.parse(JSON.stringify(this.streamerQueue))
        for (let i = 0; i < tempQueue.length; i++) {
          if (tempQueue[i].id === id) {
            tempQueue.splice(i, 1)
            break
          }
        }
        this.streamerQueue = tempQueue
        saveQueue()
      },
    },
  })

}
