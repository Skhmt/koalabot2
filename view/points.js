/*jshint
  esversion: 6,
  node: true
*/

module.exports = function(Vue, $){

  Vue.component('points', {
    template: require('pug').renderFile('./view/points.pug'),
    data: function () { return {
      foo: '1'
    }; },
    methods: {
      fubar: function (x) {
        // something
      }
    }
  });

};
