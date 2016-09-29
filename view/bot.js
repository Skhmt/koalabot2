/*jshint
  esversion: 6,
  node: true
*/

module.exports = function(Vue, $){

  require('./chat.js')(Vue, $)
  require('./music.js')(Vue, $)
  require('./points.js')(Vue, $)

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
  }


  Vue.component('bot', {
    template: require('pug').renderFile('./view/bot.pug'),
    data: function () { return data; },
    methods: {
      isTab: function(name) {
        return this.currTab === name
      },
      changeTab: function (name) {
        this.currTab = name
      },
      fadeBeforeEnter: function (el) {
        $(el).velocity('fadeOut', {duration: 0})
      },
      fadeEnter: function (el, done) {
        $(el).velocity('transition.fadeIn', {delay: 180, duration: 160}, done)
      },
      fadeLeave: function (el, done) {
        $(el).velocity('transition.fadeOut', {duration: 160}, done)
      },
    } // methods
  }) // Vue.component

}
