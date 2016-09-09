
/*jshint
  esversion: 6,
  node: true
*/

module.exports = function(Vue, $){

  let data = {
    chatLines: [],
    tapicStreamer: require('../lib/tapic-streamer.js'),
    tapicBot: require('../lib/tapic-bot.js'),
    followers: '',
    watching: '',
    totalViews: '',
    chatters: '',
    submitChatBox: '',
    selectChatBox: 'streamer',
    userlist: '',
  };

  // Getting emoticons
  // TODO: https://www.frankerfacez.com/developers
  let emoticons = new Map();
  data.tapicStreamer.listen('raw', function (msg) {
    if (msg.substring(0,18) === ':tmi.twitch.tv 001') {
      $.getJSON(
    		`https://api.betterttv.net/2/channels/${data.tapicStreamer.getUsername()}`,
    		{},
    		function (response) {
    			if ("emotes" in response) {
    				for (var i in response.emotes) {
    					emoticons.set(response.emotes[i].code, `https://cdn.betterttv.net/emote/${response.emotes[i].id}/1x`);
    				}
    			}
          else console.error('Could not get BTTV channel emoticons.');
    		}
    	);
      $.getJSON(
    		'https://api.twitch.tv/kraken/chat/emoticons',
    		{
    			client_id: 'odxxxgp3cpbeuqybayvhwinz8zl0paf',
    			api_version: 3
    		},
    		function(response) {
    			if ('emoticons' in response) {
    				for (let i in response.emoticons) {
    					emoticons.set(response.emoticons[i].regex, response.emoticons[i].images[0].url);
    				}
    			}
          else console.error('Could not get Twitch emoticons.');
    		}
    	);
      $.getJSON(
    		'https://api.betterttv.net/emotes',
    		{},
    		function (response) {
    			if ("emotes" in response) {
    				for (var i in response.emotes) {
    					emoticons.set(response.emotes[i].regex, `https:${response.emotes[i].url}`);
    				}
    			}
          else console.error('Could not get BTTV emoticons.');
    		}
    	);
    }
  });

  function addChat(text) {
    var $panel = $('#chatPanel');

    // scrollHeight = element's total height including overflow
  	// clientHeight = element's height including padding excluding horizontal scroll bar
  	// scrollTop = distance from an element's top to its topmost visible content, it's 0 if there's no scrolling needed
  	// allow 1px inaccuracy by adding 1

    // if it's scrolled to the bottom within 5px before a chat message shows up, set isScrolledToBottom to true
    var isScrolledToBottom = $panel.prop("scrollHeight") - $panel.prop("clientHeight") <= $panel.prop("scrollTop") + 5;

    // add message
    data.chatLines.push(text);
    if (data.chatLines.length > 20) data.chatLines.shift();

    // if it was scrolled to the bottom before the message was appended, scroll to the bottom
    if (isScrolledToBottom) {
      // $panel.prop("scrollTop", $panel.prop("scrollHeight") - $panel.prop("clientHeight"));
      setTimeout(function () {
        $panel.prop("scrollTop", Number.MAX_SAFE_INTEGER);
      }, 50);
    }
  }

  data.tapicStreamer.listen('update', function () {
    let followers = data.tapicStreamer.getFollowerCount();
    let watching = data.tapicStreamer.getCurrentViewCount();
    let views = data.tapicStreamer.getTotalViewCount();
    data.followers = followers ? followers.toLocaleString() : '';
    data.watching = watching ? watching.toLocaleString() : '';
    data.totalViews = views ? views.toLocaleString() : '';
    updateChatters();
  });

  // chatters
  function updateChatters() {
    let chatters = data.tapicStreamer.getChatters();
    let output = '';

    if (typeof chatters == 'undefined') return;

    if (chatters.staff.length > 0) {
        output += `<p> <b style="color: #C9F;">STAFF</b> &mdash;
			<b>${chatters.staff.length.toLocaleString()}</b> <br> `;
        for (var i = 0; i < chatters.staff.length; i++) {
            let tempuser = chatters.staff[i];
            output += `${tempuser} <br> `;
        }
        output += '</p> ';
    }

    if (chatters.moderators.length > 0) {
        output += `<p> <b style="color: #34ae0a;">MODS</b> &mdash;
			<b>${chatters.moderators.length.toLocaleString()}</b> <br> `;
        for (let i = 0; i < chatters.moderators.length; i++) {
            let tempuser = chatters.moderators[i];
            output += `${tempuser} <br> `;
        }
        output += '</p> ';
    }

    if (chatters.admins.length > 0) {
        output += `<p> <b style="color: #faaf19;">ADMINS</b> &mdash;
			<b>${chatters.admins.length.toLocaleString()}</b> <br> `;
        for (let i = 0; i < chatters.admins.length; i++) {
            let tempuser = chatters.admins[i];
            output += `${tempuser} <br> `;
        }
        output += '</p> ';
    }

    if (chatters.global_mods.length > 0) {
        output += `<p> <b style="color: #1a7026;">GLOBAL MODS</b> &mdash;
			<b>${chatters.global_mods.length.toLocaleString()}</b> <br> `;
        for (let i = 0; i < chatters.global_mods.length; i++) {
            let tempuser = chatters.global_mods[i];
            output += `${tempuser} <br> `;
        }
        output += '</p> ';
    }

    if (chatters.viewers.length > 0) {
        output += `<p> <b style="color: #3CF;">VIEWERS</b> &mdash;
			<b>${chatters.viewers.length.toLocaleString()}</b> <br> `;
        for (let i = 0; i < chatters.viewers.length; i++) {
            let tempuser = chatters.viewers[i];
            output += `${tempuser} <br> `;
        }
        output += '</p> ';
    }

    data.userlist = output;
  }

  function addEmoticons(message, em) {
  	let text = message.split(' ');
    let streamerName = data.tapicStreamer.getUsername();
    let botName = data.tapicBot.getUsername();

  	// for each word, check if it's an emoticon and if it is, output the url instead of the text
  	for (let i = 0; i < text.length; i++) {
  		let word = text[i];
      let wordlc = word.toLowerCase();
      if (wordlc === streamerName || wordlc === botName) {
        text[i] = `<span style="background-color: #e5c07b; color: #21252b">${word}</span>`;
      }
      else if (em.has(word)) {
  			text[i] = `<abbr title="${word}" style="border: 0;"><img src="${em.get(word)}"></abbr>`;
  		}
  	}
  	return text.join(' ');
  }

  // Listeners
  data.tapicStreamer.listen('message', function (res) {
    let message = res.text;
    // sanitize
    message = message.replace('<', '&lt;').replace('(', '&#40;');
    // emoticons
    message = addEmoticons(message, emoticons);

    let output = `${res.mod ? '<img src="http://chat-badges.s3.amazonaws.com/mod.png">' : ''}
      ${res.sub ? '<img src="' + data.tapicStreamer.getSubBadgeUrl() + '">' : ''}
      ${res.turbo ? '<img src="http://chat-badges.s3.amazonaws.com/turbo.png">' : ''}
      <strong style="color: ${res.color};">
        ${res.from}
      </strong>
      ${res.action ? '<span style="color: ' + res.color + ';">' : ':  '}
        ${message}
      ${res.action ? '</span>' : '' }`;
    addChat(output);
  });

  data.tapicStreamer.listen('whisper', function (res) {
    let output = `${res.turbo ? '<img src="http://chat-badges.s3.amazonaws.com/turbo.png">' : ''}
      <strong style="color: ${res.color};">
        ${res.from}
      </strong>
      <i class="fa fa-arrow-right"></i>
      <strong style="color: ${data.tapicStreamer.getColor()}"> ${res.to} </strong> : ${res.text}`;
    addChat(output);
  });

  data.tapicBot.listen('whisper', function (res) {
    let output = `${res.turbo ? '<img src="http://chat-badges.s3.amazonaws.com/turbo.png">' : ''}
      <strong style="color: ${res.color};">
        ${res.from}
      </strong>
      <i class="fa fa-arrow-right"></i>
      <strong style="color: ${data.tapicBot.getColor()}"> ${res.to} </strong> : ${res.text}`;
    addChat(output);
  });

  data.tapicStreamer.listen('notice', function (res) {
    let output = `* <em>${res}</em>`;
    addChat(output);
  });

  data.tapicStreamer.listen('echoChat', function (res) {
    // not echoing commands
    if (res.substring(0,1) === '/' || res.substring(0,1) === '.') return;

    let message = res;
    // sanitize
    message = message.replace('<', '&lt;').replace('(', '&#40;');
    // emoticons
    message = addEmoticons(message, emoticons);

    let output = `<img src="http://chat-badges.s3.amazonaws.com/broadcaster.png"> <strong style="color: ${data.tapicStreamer.getColor()};">${data.tapicStreamer.getDisplayName()}</strong> : ${message}`;
    addChat(output);
  });

  data.tapicStreamer.listen('echoWhisper', function (res) {
    let message = res.text;
    // sanitize
    message = message.replace('<', '&lt;').replace('(', '&#40;');
    // emoticons
    message = addEmoticons(message, emoticons);

    let output = `<strong style="color: ${data.tapicStreamer.getColor()}"> ${data.tapicStreamer.getUsername()} </strong>
    <i class="fa fa-arrow-right"></i>
    <strong style="color: #6441A5;">${res.to}</strong> : ${message}`;
    addChat(output);
  });

  data.tapicBot.listen('echoWhisper', function (res) {
    let message = res.text;
    // sanitize
    message = message.replace('<', '&lt;').replace('(', '&#40;');
    // emoticons
    message = addEmoticons(message, emoticons);

    let output = `<strong style="color: ${data.tapicBot.getColor()}"> ${data.tapicBot.getUsername()} </strong>
    <i class="fa fa-arrow-right"></i>
    <strong style="color: #6441A5;">${res.to}</strong> : ${message}`;
    addChat(output);
  });

  data.tapicStreamer.listen('host', function (res) {
    addChat(`* <em>HOST: ${res}</em>`);
  });

  data.tapicStreamer.listen('follow', function (res) {
    addChat(`* <em>FOLLOW: ${res}</em>`);
  });

  data.tapicStreamer.listen('sub', function (res) {
    addChat(`* <em>SUB: ${res}</em>`);
  });

  data.tapicStreamer.listen('subMonths', function (res) {
    let output = `* <em>RESUB: ${res.name} x${res.months}`;
    if (res.message) {
      output += `&nbsp; "${res.message}"`;
    }
    addChat(output + '</em>');
  });

  data.tapicStreamer.listen('subsAway', function (res) {
    addChat(`* <em>${res} subscribers since you've last been on.</em>`);
  });

  data.tapicStreamer.listen('clearChat', function () {
    addChat(`* <em>Chat has been cleared.</em>`);
  });

  data.tapicStreamer.listen('clearUser', function (res) {
    const name = res.name;
    const reason = res.reason;
    const duration = res.duration;
    let output = `* <em>${name} has been `;

    if (duration) output += 'timed out';
    else output += 'banned';

    if (reason) output += ` for ${reason}`;
    output += '.</em>';
    addChat(output);
  });

  Vue.component('chat', {
    template: require('pug').renderFile('./view/chat.pug'),
    data: function () { return data; },
    methods: {
      sendChat: function (who, message) {
        // checking if it's a whisper
        let messageArray = message.split(' ');
        let isWhisper = false;
        let whisperTo = '';
        let whisperText = '';
        if (messageArray[0] == '/w' || messageArray[0] == '.w') {
          isWhisper = true;
          whisperTo = messageArray[1];
          messageArray.splice(0,2);
          whisperText = messageArray.join(' ');
        }

        if (message.length > 500) {
          addChat('* <em>Message over the 500 character limit and was not sent.</em>');
        }
        else if (who === 'streamer') {
          if (isWhisper) this.tapicStreamer.sendWhisper(whisperTo, whisperText);
          else this.tapicStreamer.sendChat(message);
        }
        else { // bot
          if (isWhisper) this.tapicBot.sendWhisper(whisperTo, whisperText);
          else this.tapicBot.sendChat(message);
        }
        this.submitChatBox = '';
      },
    }
  });

};
