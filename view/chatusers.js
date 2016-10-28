// basic

module.exports = function(Vue) {
  let store = require('../lib/store')
  let window = store.window()
  let data = {}

  Vue.component('glass', {
    template: require('pug').renderFile('./view/glass.pug'),
    data: () => data,
    methods: {
    },
  })
}
