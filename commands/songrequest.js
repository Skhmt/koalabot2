// !songrequest

module.exports = (function () {
  let store = require('../lib/store')

  function run(text, username, mod, sub) {
    store.emit('command:songrequest', {
      text,
      username,
    })
  }

  return { type: 'static', run }
})()
