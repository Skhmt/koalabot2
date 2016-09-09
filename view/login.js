/*jshint
  esversion: 6,
  node: true
*/

module.exports = function(Vue, $){

  let data = {
    clientidstreamer : 'odxxxgp3cpbeuqybayvhwinz8zl0paf',
    clientidbot : 'yl0obc8a87105urd9n1excnj12hyb1',
    tapicStreamer : require('../lib/tapic-streamer.js'),
    tapicBot : require('../lib/tapic-bot.js'),
    streamerName : '',
    botName : '',
    showTwitchLogin: false,
    server: null,
    isServerSetup: false,
  };

  if (localStorage.getItem('streamerOauth')) {
    getName(localStorage.getItem('streamerOauth'), function (name) {
      data.streamerName = name;
    });
  }

  if (localStorage.getItem('botOauth')) {
    getName(localStorage.getItem('botOauth'), function (name) {
      data.botName = name;
    });
  }

  function getName(oauth, callback) {
    oauth = oauth.replace('oauth:', '');
    $.getJSON(`https://api.twitch.tv/kraken?api_version=3&oauth_token=${oauth}`,
      function (res) {
        callback(res.token.user_name)
      }
    );
  }

  Vue.component('login', {
    template: require('pug').renderFile('./view/login.pug'),
    data: function () { return data; },
    methods: {
      serverSetup: function () {
        let _this = this;
        let express = require('express');
        let app = express();
        app.use( express.static('./public') );
        app.get( '/streamer/:token', function(req, res) {
          _this.showTwitchLogin = false;
          let oauth = req.params.token;
          res.send('OK');
          localStorage.setItem('streamerOauth', oauth);
          getName(localStorage.getItem('streamerOauth'), function (name) {
            _this.streamerName = name;
          });
        } );
        app.get( '/bot/:token', function(req, res) {
          _this.showTwitchLogin = false;
          let oauth = req.params.token;
          res.send('OK');
          localStorage.setItem('botOauth', oauth);
          getName(localStorage.getItem('botOauth'), function (name) {
            _this.botName = name;
          });
        } );
        app.get( '/cancel/', function(req, res) {
          _this.showTwitchLogin = false;
          res.send('OK');
        } );
        this.server = app.listen( 3000 );
        this.isServerSetup = true;
      },
      streamerLogin: function () {
        if (!this.isServerSetup) this.serverSetup();

        this.showTwitchLogin = true;
        $('#twitchLoginFrame').attr('src', `https://api.twitch.tv/kraken/oauth2/authorize?response_type=token
&client_id=${this.clientidstreamer}
&redirect_uri=http://localhost:3000/streamer.html
&scope=channel_editor+chat_login+channel_commercial+channel_subscriptions+channel_check_subscription
&force_verify=true`);
      },
      botLogin: function() {
        if (!this.isServerSetup) this.serverSetup();

        this.showTwitchLogin = true;
        $('#twitchLoginFrame').attr('src', `https://api.twitch.tv/kraken/oauth2/authorize?response_type=token
&client_id=${this.clientidbot}
&redirect_uri=http://localhost:3000/bot.html
&scope=channel_editor+chat_login+channel_commercial
&force_verify=true`);
      },
      login: function (streamerName, botName) {
        let _this = this;
        if (streamerName && botName) {
          _this.$parent.loggedIn = true;
          _this.tapicStreamer.setup(_this.clientidstreamer, localStorage.getItem('streamerOauth'), function (name) {
            _this.tapicStreamer.joinChannel(_this.streamerName, function () {});
            if (_this.isServerSetup) _this.server.close();
          });
          _this.tapicBot.setup(_this.clientidbot, localStorage.getItem('botOauth'), function (name) {
            _this.tapicBot.joinChannel(_this.streamerName, function () {});
          });
        }
      },
      andand: function (one, two) {
        return (one && two);
      },
      slideRightBigBeforeEnter: function (el) {
        $(el).velocity('fadeOut', {duration: 0});
      },
      slideRightBigEnter: function (el, done) { //180, 160
        $(el).velocity('transition.slideRightBigIn', {delay: 180, duration: 500}, done);
      },
      slideRightBigLeave: function (el, done) { //160
        $(el).velocity('transition.slideRightBigOut', {duration: 500}, done);
      },
    }, // methods
    computed: {

    }
  }); // component

}; // module
