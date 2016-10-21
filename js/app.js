/*jshint
  esversion: 6,
  node: true
*/

// song request server
let express = require('express')
let app = express()
app.use(express.static('./public'))
app.listen(3001)

let store = require('./lib/store')
store.init(window, err => {
  if (err) console.error(err)
  else {
    require('./view/login')(Vue)
    require('./view/bot')(Vue)
    require('./js/commands')
    setupVM()
  }
})

function setupVM() {
  // Setting the Vue view model
  var vm = new Vue({
    el: '#app',
    data: {
      loggedIn: false
    },
    methods: {
      fadeBeforeEnter: function (el) {
        Velocity(el, 'fadeOut', {duration: 0})
      },
      fadeEnter: function (el, done) {
        Velocity(el, 'transition.fadeIn', {delay: 180, duration: 160}, done)
      },
      fadeLeave: function (el, done) {
        Velocity(el, 'transition.fadeOut', {duration: 160}, done)
      },
    }
  })
}

// Utility functions

function setTitle (text) {
  document.getElementByTagName('title')[0].innerHTML = `${text} &mdash; KoalaBot ${nw.App.manifest.version}`
}

function openExtLink (url) {
	nw.Shell.openExternal(url)
}

function getIP () {
  var os = require('os')
  var interfaces = os.networkInterfaces()
  var addresses = []
  for (var k in interfaces) {
      for (var k2 in interfaces[k]) {
          var address = interfaces[k][k2]
          if (address.family  === 'IPv4' && !address.internal) {
              addresses.push(address.address)
          }
      }
  }

  return addresses[0]
}

function getPath () {
  let execPath = ''
  if (process.platform == 'win32') execPath = require('path').dirname(process.execPath) + '/'
  return execPath
}
