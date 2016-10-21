/*jshint
  esversion: 6,
  node: true
*/

module.exports = function(Vue){
  let store = require('../lib/store')
  let window = store.window()

  let data = {
    clientidstreamer : 'odxxxgp3cpbeuqybayvhwinz8zl0paf',
    clientidbot : 'yl0obc8a87105urd9n1excnj12hyb1',
    tapicStreamer : require('../lib/tapic-streamer'),
    tapicBot : require('../lib/tapic-bot'),
    streamerName : '',
    botName : '',
    streamerPicture: '',
    botPicture: '',
    showStreamerLogin: false,
    showBotLogin: false,
    server: null,
    isServerSetup: false,
    greeting: '¯\\_(ツ)_/¯',
  }

  store.getItem('streamerOauth', (err, res) => {
    if (!err) {
      getName(res, name => {
        data.streamerName = name
        getLogo(name, res, imgUrl => data.streamerPicture = imgUrl)
      })
    }
    else console.error(err)
  })

  store.getItem('botOauth', (err, res) => {
    if (!err) {
      getName(res, name => {
        data.botName = name
        getLogo(name, res, imgUrl => data.botPicture = imgUrl)
      })
    }
    else console.error(err)
  })

  function getName(oauth, callback) {
    oauth = oauth.replace('oauth:', '')
    const url = `https://api.twitch.tv/kraken?api_version=3&oauth_token=${oauth}`
    window.fetch(url).then(res => res.json()).then(res => callback(res.token.user_name))
  }

  function getLogo(username, oauth, callback) {
    oauth = oauth.replace('oauth:', '')
    const url = `https://api.twitch.tv/kraken/channels/${username}?api_version=3&oauth_token=${oauth}`
    window.fetch(url).then(res => res.json()).then(res => callback(res.logo))
  }

  Vue.component('login', {
    template: require('pug').renderFile('./view/login.pug'),
    data: function () { return data },
    methods: {
      serverSetup: function () {
        let _this = this
        let express = require('express')
        let app = express()
        app.use(express.static('./public'))
        app.get('/streamer/:token', function (req, res) {
          _this.showStreamerLogin = false
          window.document.getElementById('streamerLoginFrame').src = ''
          let oauth = req.params.token
          res.send('OK')
          store.setItem('streamerOauth', oauth)
          getName(oauth, name => {
            _this.streamerName = name
            getLogo(name, oauth, imgUrl => _this.streamerPicture = imgUrl)
          })

        })
        app.get('/bot/:token', function (req, res) {
          _this.showBotLogin = false
          window.document.getElementById('botLoginFrame').src = ''
          let oauth = req.params.token
          res.send('OK')
          store.setItem('botOauth', oauth)
          getName(oauth, name => {
            _this.botName = name
            getLogo(name, oauth, imgUrl => _this.botPicture = imgUrl)
          })
        })
        app.get('/cancel/', function(req, res) {
          _this.showStreamerLogin = false
          _this.showBotLogin = false
          res.send('OK')
        })
        this.server = app.listen( 3000 )
        this.isServerSetup = true
      },
      streamerLogin: function () {
        if (!this.isServerSetup) this.serverSetup()

        const path = 'https://api.twitch.tv/kraken/oauth2/authorize'
        const scope = 'channel_editor+chat_login+channel_commercial+channel_subscriptions+channel_check_subscription'
        const redirect_uri = 'http://localhost:3000/streamer.html'
        const url = `${path}?response_type=token&client_id=${this.clientidstreamer}&redirect_uri=${redirect_uri}&scope=${scope}&force_verify=true`

        let $login = window.document.getElementById('streamerLoginFrame')
        if ($login.src != url) $login.src = url
        this.showStreamerLogin = true
      },
      botLogin: function() {
        if (!this.isServerSetup) this.serverSetup();

        const path = 'https://api.twitch.tv/kraken/oauth2/authorize'
        const scope = 'channel_editor+chat_login+channel_commercial'
        const redirect_uri = 'http://localhost:3000/bot.html'
        const url = `${path}?response_type=token&client_id=${this.clientidbot}&redirect_uri=${redirect_uri}&scope=${scope}&force_verify=true`;

        let $login = window.document.getElementById('botLoginFrame');
        if ($login.src != url) $login.src = url
        this.showBotLogin = true
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
      fadeBeforeEnter: function (el) {
        window.Velocity(el, 'fadeOut', {duration: 0})
      },
      fadeEnter: function (el, done) {
        window.Velocity(el, 'transition.fadeIn', {delay: 180, duration: 160}, done)
      },
      fadeLeave: function (el, done) {
        window.Velocity(el, 'transition.fadeOut', {duration: 160}, done)
      },
    }, // methods
    computed: {

    }
  }) // component

} // module
