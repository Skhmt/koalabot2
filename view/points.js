/*jshint
  esversion: 6,
  node: true
*/
module.exports = function(Vue) {
  let store = require('../lib/store')
  let window = store.window()
  let data = {}

  Vue.component('points', {
    template: require('pug').renderFile('./view/points.pug'),
    data: () => data,
    methods: {
    },
  })
}
