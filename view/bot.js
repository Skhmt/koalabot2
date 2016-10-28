/*jshint
  esversion: 6,
  node: true
*/

module.exports = function(Vue){

  require('./chat.js')(Vue)
  require('./music.js')(Vue)
  require('./points.js')(Vue)
  require('./tab.js')(Vue)
  let store = require('../lib/store')
  let window = store.window()

  let data = {
    navItems: [
      {name: 'Chat', icon: 'fa-commenting'},
      {name: 'Music', icon: 'fa-music'},
      {name: 'Points', icon: 'fa-star'},
      {name: 'Timers', icon: 'fa-clock-o'},
      {name: 'Commands', icon: 'fa-code'},
      {name: 'Quotes', icon: 'fa-quote-left'},
      {name: 'Games', icon: 'fa-gamepad'},
      {name: 'Twitch', icon: 'fa-twitch'},
      {name: 'Modules', icon: 'fa-puzzle-piece'},
      {name: 'Logs', icon: 'fa-folder-open'},
      {name: 'Stats', icon: 'fa-bar-chart'},
      {name: 'Settings', icon: 'fa-gears'},
    ],
    currTab: 'Chat',
    iconNav: true,
    bindbg: '',
    bindbgAngle1: 120,
    bindbgAngle2: 0,
    bindbgAngle3: 240,
    bindbgAnimate: true,
  }

  window.requestAnimationFrame(setBG)
  function setBG() {
    const speed = 0.75
    data.bindbgAngle1 = (data.bindbgAngle1 + speed) % 360
    data.bindbgAngle2 = (data.bindbgAngle2 + speed) % 360
    data.bindbgAngle3 = (data.bindbgAngle3 + speed) % 360
    data.bindbg = 'background: ' +
      `linear-gradient(${data.bindbgAngle1}deg, LightSkyBlue, transparent),` +
      `linear-gradient(${data.bindbgAngle2}deg, Orchid, transparent), ` +
      `linear-gradient(${data.bindbgAngle3}deg, Khaki, transparent); ` +
      'background-blend-mode: multiply; ' +
      'box-shadow: inset 0px 0px 300px 10px rgba(0,0,0,0.8);'
    if (data.bindbgAnimate) window.requestAnimationFrame(setBG)
  }



  Vue.component('bot', {
    template: require('pug').renderFile('./view/bot.pug'),
    data: () => data,
    methods: {
      isTab: function(name) {
        return this.currTab === name
      },
      changeTab: function (name) {
        this.currTab = name
      },
    } // methods
  }) // Vue.component

}
