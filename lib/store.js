/*
  Events / pubsub module in ES6 for node.js
  Also data map to replace localStorage
  TODO: fs save/load/etc,
*/

/*jshint
  esversion: 6,
  unused: true,
  undef: true,
  node: true
*/

module.exports = (function () {
  let events = new Map();
  let storage = new Map();

  let path;
  if ( process.platform === 'win32' ) {
    path = `${require('path').dirname(process.execPath)}/`;
  }
  else { // 'darwin' would be OS X
    path = '';
  }

  // events
  function on(key, fn) {
    if (events.has(key)) { // if there are listeners for key
      let values = events.get(key); // get the current array of callback functions
      values.push(fn); // add the new callback function
      events.set(key, values); // replace the old callback function array
    }
    else { // if key has no listeners, create it
      events.set(key, [fn]);
    }
  }

  function off(key, fn) {
    if (events.has(key)) { // if there are listeners for key
      let values = events.get(key); // get the current array of callback functions
      for (let i = 0; i < values.length; i++) {
        if (values[i] == fn) {
          values.splice(i, 1);
          break;
        }
      }
      events.set(key, values); // replace the old callback function array
    }
  }

  function emit(key, data) {
    if (events.has(key)) {
      let callbacks = events.get(key); // gets an array of callback functions
      callbacks.forEach(function (fn) {
        fn(data);
      } );
    }
  }

  // turn the map into a dictionary then stringify it
  function stringify(map) {
    let output = Object.create(null);
    map.forEach(function (value, key, map) {
      let valArray = [];
      for (let i = 0; i < value.length; i++) {
        valArray.push(value[i]);
      }
      output[key] = valArray;
    });
    return JSON.stringify(output);
  }

  // storage
  function get(key) {
    return storage.get(key);
  }

  function set(key, value) {
    storage.set(key, value);
  }

  function has(key) {
    return storage.has(key);
  }

  function del(key) {
    storage.delete(key);
  }

  function clear() {
    storage.clear();
  }

  return {
    emit,
    on,
    off,
    get,
    set,
    has,
    del,
    clear,
  };
})();
