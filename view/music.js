/*jshint
  esversion: 6,
  node: true
*/

/* TODO
  Save/load streamerQueue
*/

module.exports = function(Vue, $){
  let ytAPIkey = 'AIzaSyDHIEtPmB3cOp2nHFA9T2LAz-xcfXyZJ2A';
  let ytPlayer;

  let data = {
    requestQueue: [],
    streamerQueue: [
      {
        id: 'NR7dG_m3MsI',
        title: 'Killswitch Engage - Holy Diver [OFFICIAL VIDEO]',
      },
      {
        id: 'u9Dg-g7t2l4',
        title: 'Disturbed - The Sound Of Silence [Official Music Video]',
      },
      {
        id: '8VgLKXD-BoY',
        title: 'Nightwish "The Phantom Of The Opera" with lyrics',
      },
      {
        id: '7x_0_frOl4c',
        title: 'Flawless Real Talk- Doctor',
      },
      {
        id: 'hehLnF_cSQo',
        title: 'MFBTY Drunken Tiger \'살자 The Cure\' Sub Espanol',
      },
      {
        id: '4e4bAsQ4r30',
        title: 'Leo & Stine Moracchioli - Zombie'
      },
    ],
    currentSong: {
      id: 'vxIOUJ7by6U',
      title: 'Electric Daisy Violin - Lindsey Stirling',
    },
    currentTime: '00:00',
    duration: '00:00',
    streamerInput: '',
    requestInput: '',
  };

  (function songStateChecker() {
    try {
      // unstarted: -1, ended: 0, playing: 1, paused: 2, buffering: 3, cued: 5
      let state = ytPlayer.getPlayerState();
      if (state === -1 || state === 0) nextSong();

      let currentTime = ytPlayer.getCurrentTime();
      let duration = ytPlayer.getDuration();
      data.currentTime = secondsToMinutes(currentTime);
      data.duration = secondsToMinutes(duration);

      let scrubWidth = (currentTime / duration) * $('#scrubContainer').width();
      $('#scrub').css('width', scrubWidth+'px');

    } catch (e) {}
    setTimeout(songStateChecker, 250);
  })();

  function secondsToMinutes(totalSeconds) {
    let minutes = (totalSeconds / 60)|0;
    let seconds = (totalSeconds % 60)|0;
    let leadingMinutesZero = '';
    if (minutes < 10) leadingMinutesZero = '0';
    let leadingSecondsZero = '';
    if (seconds < 10) leadingSecondsZero = '0';
    return leadingMinutesZero + minutes + ':' + leadingSecondsZero + seconds;
  }

  let tapicStreamer = require('../lib/tapic-streamer.js');
  tapicStreamer.listen('join', initMusic);
  function initMusic(name) {
    if (name !== tapicStreamer.getUsername()) return;

    $('#ytPlayer').attr('src', 'http://localhost:3001/yt.html');

    (function setPlayer() {
      ytPlayer = $('#ytPlayer')[0].contentWindow.ytPlayer;
      if (ytPlayer == undefined) {
        setTimeout(setPlayer, 50);
      }
      else {
        ytPlayer.addEventListener('onError', function (e) {
          console.log(`Youtube error ${e.data}`);
        });
      }
    })();

    // https://github.com/aterrien/jQuery-Knob
    $('#volKnob').knob({
      angleArc: 240,
      angleOffset: 240,
      thickness: '.25',
      width: 200,
      fgColor: '#98c379',
      bgColor: '#3B3E45',
      step: 1,
      cursor: 2,
      change: function (v) {
        ytPlayer.setVolume(v);
      },
      release: function (v) {
        ytPlayer.setVolume(v);
      },
    });

    $('#scrubContainer').click(function (e) {
      let offset = $(this).offset();
      let pixelsFromLeft = e.pageX - offset.left;
      let containerWidth = $(this).width();
      let scrubTimePercent = Math.round( (pixelsFromLeft/containerWidth*100) ) * 0.01;
      let scrubTime = (scrubTimePercent * ytPlayer.getDuration())|0;
      ytPlayer.seekTo(scrubTime, true);
    });
  }

  function nextSong() {
    data.currentSong = '';
    if (data.requestQueue.length > 0) {
      let tempSong = data.requestQueue.shift();
      ytPlayer.loadVideoById(tempSong.id, 0, 'medium');
      ytPlayer.playVideo();
      data.currentSong = tempSong;
      // fs.writeFile( `${execPath}txt/song-current.txt`, currentSong.title );
    }
    else if (data.streamerQueue.length > 0) {
      let tempSong = data.streamerQueue.shift();
      ytPlayer.loadVideoById(tempSong.id, 0, 'medium');
      ytPlayer.playVideo();
      data.currentSong = tempSong;
      data.streamerQueue.push( tempSong );
      // fs.writeFile( `${execPath}txt/song-current.txt`, currentSong.title );
    }
  }

  function sanitizeYT(url) {
    return url.replace('https://', '')
      .replace('http://', '')
      .replace('youtu.be/', '')
      .replace('www.youtube.com/watch?v=', '')
      .replace('m.youtube.com/watch?v=', '')
      .split('&')[0]
      .split('?')[0];
  }

  function addSongStreamer(videoid) {
    // allows most copy-pastes to work
    if ( videoid.length != 11 ) {
      videoid = sanitizeYT(videoid);
    }

    // check if it's already in there
    let found = false;
    for (let i = 0; i < data.streamerQueue.length; i++) {
      if (data.streamerQueue[i].id === videoid) {
        found = true;
        break;
      }
    }
    if (found) {
      // TODO some message
      return;
    }

    $.getJSON(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        id: videoid,
        part: 'snippet',
        key: ytAPIkey
      },
      function( response ) {
        if (response.pageInfo.totalResults == 0) {
          // cmdSay( "Error, invalid youtube video." );
        }
        else {
          let videotitle = response.items[0].snippet.title;
          let pushObj = {
            id: videoid,
            title: videotitle,
          };
          data.streamerQueue.push(pushObj);
          // log( `* "${videotitle}" added to the streamer song queue.` );

          // If after adding a song, the player isn't playing, start it
          let state = ytPlayer.getPlayerState();
          if (state !== 1 && state !== 2) nextSong();
        }
      }
    );
  }

  function addSongRequest(videoid, username) {
    // allows most copy-pastes to work
    if ( videoid.length != 11 ) {
      videoid = sanitizeYT(videoid);
    }

    // check if it's already in there
    let found = false;
    for (let i = 0; i < data.requestQueue.length; i++) {
      if (data.requestQueue[i].id === videoid) {
        found = true;
        break;
      }
    }
    if (found) {
      // TODO some message
      return;
    }

    $.getJSON(
      'https://www.googleapis.com/youtube/v3/videos',
      {
        id: videoid,
        part: 'snippet',
        key: ytAPIkey
      },
      function( response ) {
        if ( response.pageInfo.totalResults == 0 ) {
          // cmdSay( "Error, invalid youtube video." );
        }
        else {
          let videotitle = response.items[0].snippet.title;

          let pushObj = {
            id: videoid,
            title: videotitle,
            user: username,
          };
          data.requestQueue.push(pushObj);
          // cmdSay( `"${videotitle}" added to the queue by ${username}` );

          // If after adding a song, the player isn't playing, start it
          let state = ytPlayer.getPlayerState();
          if (state !== 1 && state !== 2) nextSong();
        }
      }
    );
  }

  function toggleMute() {
    if (ytPlayer.isMuted()) {
      ytPlayer.unMute();
    } else {
      ytPlayer.mute();
    }
  }

  // Fisher-Yates shuffle
  function shuffle(inputArray) {
    let array = JSON.parse(JSON.stringify(inputArray));
  	const len = array.length;
  	for (let i = 0; i < len-2; i++) {
    	const select = i + (Math.random() * (len - i))|0;
      const swap = array[i];
      array[i] = array[select];
      array[select] = swap;
    }
    return array;
  }

  Vue.component('music', {
    template: require('pug').renderFile('./view/music.pug'),
    data: function () { return data; },
    methods: {
      nextSong: function () {
        nextSong();
      },
      shuffleStreamer: function () {
      	this.streamerQueue = shuffle(this.streamerQueue);
      },
      shuffleRequest: function () {
      	this.requestQueue = shuffle(this.requestQueue);
      },
      addStreamer: function () {
        addSongStreamer(this.streamerInput);
        this.streamerInput = '';
      },
      addRequest: function () {
        addSongRequest(this.requestInput, tapicStreamer.getDisplayName());
        this.requestInput = '';
      },
      favorite: function () {
        addSongStreamer(this.currentSong.id);
      },
      removeRequest: function (id) {
        for (let i = 0; i < this.requestQueue.length; i++) {
          if (this.requestQueue[i].id === id) {
            this.requestQueue.splice(i, 1);
            break;
          }
        }
      },
      removeStreamer: function (id) {
        for (let i = 0; i < this.streamerQueue.length; i++) {
          if (this.streamerQueue[i].id === id) {
            this.streamerQueue.splice(i, 1);
            break;
          }
        }
      },
    },
  });

};
