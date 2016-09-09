/*jshint
  esversion: 6,
  node: true
*/

module.exports = function(Vue, $){

  let template = require('pug').render(`
slot
  `);

  Vue.component('component name', {
    template,
    data: function () { return {
      foo: bar
    }; },
    methods: {
      fubar: function (x) {
        // something
      }
    }
  });

};
