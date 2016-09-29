/*jshint
  esversion: 6,
  node: true
*/

module.exports = function(Vue, $){
  let store = require('../lib/store')

  let data = {
    clientidstreamer : 'odxxxgp3cpbeuqybayvhwinz8zl0paf',
    clientidbot : 'yl0obc8a87105urd9n1excnj12hyb1',
    tapicStreamer : require('../lib/tapic-streamer'),
    tapicBot : require('../lib/tapic-bot'),
    streamerName : '',
    botName : '',
    showTwitchLogin: false,
    server: null,
    isServerSetup: false,
  }

  store.getItem('streamerOauth', (err, res) => {
    if (!err) getName(res, name => data.streamerName = name)
    else console.error(err)
  })

  store.getItem('botOauth', (err, res) => {
    if (!err) getName(res, name => data.botName = name)
    else console.error(err)
  })

  function getName(oauth, callback) {
    oauth = oauth.replace('oauth:', '')
    const url = 'https://api.twitch.tv/kraken'
    $.getJSON(`${url}?api_version=3&oauth_token=${oauth}`, res => callback(res.token.user_name))
  }

  Vue.component('login', {
    template: require('pug').renderFile('./view/login.pug'),
    data: function () { return data },
    methods: {
      serverSetup: function () {
        let _this = this
        let express = require('express')
        let app = express()
        app.use( express.static('./public') )
        app.get( '/streamer/:token', function (req, res) {
          _this.showTwitchLogin = false
          let oauth = req.params.token
          res.send('OK')
          store.setItem('streamerOauth', oauth)
          getName(oauth, name => _this.streamerName = name)
        } )
        app.get( '/bot/:token', function (req, res) {
          _this.showTwitchLogin = false
          let oauth = req.params.token
          res.send('OK')
          store.setItem('botOauth', oauth)
          getName(oauth, name => _this.botName = name)
        } )
        app.get( '/cancel/', function(req, res) {
          _this.showTwitchLogin = false
          res.send('OK')
        } )
        this.server = app.listen( 3000 )
        this.isServerSetup = true
      },
      streamerLogin: function () {
        if (!this.isServerSetup) this.serverSetup()

        this.showTwitchLogin = true
        const url = 'https://api.twitch.tv/kraken/oauth2/authorize'
        const scope = 'channel_editor+chat_login+channel_commercial+channel_subscriptions+channel_check_subscription'
        const redirect_uri = 'http://localhost:3000/streamer.html'
        $('#twitchLoginFrame').attr('src', `${url}?response_type=token&client_id=${this.clientidstreamer}&redirect_uri=${redirect_uri}&scope=${scope}&force_verify=true`)
      },
      botLogin: function() {
        if (!this.isServerSetup) this.serverSetup();

        this.showTwitchLogin = true
        const url = 'https://api.twitch.tv/kraken/oauth2/authorize'
        const scope = 'channel_editor+chat_login+channel_commercial'
        const redirect_uri = 'http://localhost:3000/bot.html'
        $('#twitchLoginFrame').attr('src', `${url}?response_type=token&client_id=${this.clientidbot}&redirect_uri=${redirect_uri}&scope=${scope}&force_verify=true`)
      },
      login: function (streamerName, botName) {
        let _this = this
        if (streamerName && botName) {

          let gotStreamerOauth = false
          let gotBotOauth = false
          store.getItem('streamerOauth', (err, res) => {
            gotStreamerOauth = true
            setLogin()
            if (!err) {
              _this.tapicStreamer.setup(_this.clientidstreamer, res, function (name) {
                _this.tapicStreamer.joinChannel(_this.streamerName, function () {})
                if (_this.isServerSetup) _this.server.close()
              })
            }
            else console.error(err)
          })

          store.getItem('botOauth', (err, res) => {
            gotBotOauth = true
            setLogin()
            if (!err) {
              _this.tapicBot.setup(_this.clientidbot, res, function (name) {
                _this.tapicBot.joinChannel(_this.streamerName, function () {})
              })
            }
            else console.error(err)
          })

          function setLogin() {
            if (gotStreamerOauth && gotBotOauth) _this.$parent.loggedIn = true
          }
        }
      },
      andand: function (one, two) {
        return (one && two)
      },
      slideRightBigBeforeEnter: function (el) {
        $(el).velocity('fadeOut', {duration: 0})
      },
      slideRightBigEnter: function (el, done) { //180, 160
        $(el).velocity('transition.slideRightBigIn', {delay: 180, duration: 500}, done)
      },
      slideRightBigLeave: function (el, done) { //160
        $(el).velocity('transition.slideRightBigOut', {duration: 500}, done)
      },
    }, // methods
    computed: {

    }
  }) // component

} // module
