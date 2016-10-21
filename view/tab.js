
module.exports = function(Vue) {
  let store = require('../lib/store')
  let window = store.window()
  let data = {}
  Vue.component('tab', {
    template: `
    <transition
      v-on:before-enter="fadeBeforeEnter"
      v-on:enter="fadeEnter"
      v-on:leave="fadeLeave"
      v-bind:css="false">
      <div v-show="this.$parent.currTab === tabname" style="height: 100%; width: 100%;">
        <slot></slot>
      </div>
    </transition>
    `,
    props: ['tabname'],
    data: () => data,
    methods: {
      fadeBeforeEnter: function (el) {
        window.Velocity(el, 'fadeOut', {duration: 0})
      },
      fadeEnter: function (el, done) {
        window.Velocity(el, 'transition.fadeIn', {delay: 180, duration: 160}, done)
      },
      fadeLeave: function (el, done) {
        window.Velocity(el, 'transition.fadeOut', {duration: 160}, done)
      },
    },
  })
}
