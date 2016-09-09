/*jshint
  esversion: 6,
  node: true
*/

// song request server
let express = require('express');
let app = express();
app.use(express.static('./public'));
app.listen(3001);

require('./view/login.js')(Vue, $);
require('./view/bot.js')(Vue, $);

let store = require('./lib/store');

// Setting the Vue view model
var vm = new Vue({
  el: '#app',
  data: {
    loggedIn: false
  },
  methods: {
    fadeBeforeEnter: function (el) {
      $(el).velocity('fadeOut', {duration: 0});
    },
    fadeEnter: function (el, done) {
      $(el).velocity('transition.fadeIn', {delay: 180, duration: 160}, done);
    },
    fadeLeave: function (el, done) {
      $(el).velocity('transition.fadeOut', {duration: 160}, done);
    },
  }
});

// Utility functions

function setTitle(text) {
  document.getElementByTagName('title')[0].innerHTML = `${text} &mdash; KoalaBot ${nw.App.manifest.version}`;
}

function openExtLink(url) {
	nw.Shell.openExternal(url);
}

function getIP() {
  var os = require('os');
  var interfaces = os.networkInterfaces();
  var addresses = [];
  for (var k in interfaces) {
      for (var k2 in interfaces[k]) {
          var address = interfaces[k][k2];
          if (address.family  === 'IPv4' && !address.internal) {
              addresses.push(address.address);
          }
      }
  }

  return addresses[0];
}
