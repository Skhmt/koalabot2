/*
  Events / pubsub module in ES6 for node.js
  IndexedDB as asynchronous Storage for NW.js using a sharedWorker
*/

/*jshint
  esversion: 6,
  unused: true,
  undef: true,
  node: true
*/
module.exports = (function () {
  let exp = Object.create(null)
  let window

  let setup = false
  let swSetURL

  exp.init = function (win, fn) {
    window = win
    swSetURL = fn2sharedWorkerURL(sharedWorkerCode)
    let sw = new window.SharedWorker(swSetURL)
    sw.port.onmessage = function (e) {
      setup = true
      if (typeof fn === 'function') {
        if (e.data) fn(e.data)
        else fn()
      }
    }
    sw.port.postMessage({action: 'test'})
  }

  function fn2sharedWorkerURL(fn) {
    let blob = new window.Blob([`(${fn.toString()})()`], {type: 'application/javascript'})
    return window.URL.createObjectURL(blob)
  }
  function sharedWorkerCode() {
    let db

    function defineDB(fn) {
      let request = indexedDB.open('state', 1)
      request.onerror = function () {
      }
      request.onsuccess = function () {
        db = request.result
        if (typeof fn === 'function') fn()
      }
      request.onupgradeneeded = function () {
        db = request.result
        let store = db.createObjectStore('data', {keyPath: 'key'})
        store.transaction.oncomplete = function (ev) {
          if (typeof fn === 'function') fn()
        }
      }
    }

    onconnect = function (connectEvent) {
      let port = connectEvent.ports[0]
      if (!db) defineDB(handleConnection)
      else handleConnection()

      function handleConnection() {
        port.onmessage = function (e) {
          if (e.data.action === 'set') {
            let objectStore = db.transaction(['data'], 'readwrite').objectStore('data')
            let request = objectStore.put({key: e.data.key, value: e.data.value})
            request.onsuccess = function () {
              port.postMessage('')
            }
            request.onerror = function () {
              port.postMessage(request.error)
            }
          }
          else if (e.data.action === 'get') {
            let objectStore = db.transaction(['data']).objectStore('data')
            let request = objectStore.get(e.data.key)
            request.onsuccess = function () {
              port.postMessage({err:null, res:request.result.value})
            }
            request.onerror = function () {
              port.postMessage({err:request.error, res:null})
            }
          }
          else if (e.data.action === 'remove') {
            let objectStore = db.transaction(['data'], 'readwrite').objectStore('data')
            let request = objectStore.delete(e.data.key)
            request.onsuccess = function () {
              port.postMessage('')
            }
            request.onerror = function () {
              port.postMessage(request.error)
            }
          }
          else if (e.data.action === 'clear') {
            let objectStore = db.transaction(['data'], 'readwrite').objectStore('data')
            let request = objectStore.clear()
            request.onsuccess = function () {
              port.postMessage('')
            }
            request.onerror = function () {
              port.postMessage(request.error)
            }
          }
          else if (e.data.action === 'count') {
            let objectStore = db.transaction(['data']).objectStore('data')
            let request = objectStore.count()
            request.onsuccess = function () {
              port.postMessage({err:null, res:request.result})
            }
            request.onerror = function () {
              port.postMessage({err:request.error, res:null})
            }
          }
          else if (e.data.action === 'test') {
            if (!db) port.postMessage('init failed')
            else port.postMessage('')
          }
          else {
            port.postMessage('invalid sharedWorker action')
          }
        } // port.onmessage
      } // handleConnection()
    } // onconnect
  } // sharedWorkerCode

  exp.setItem = function (key, value, fn) {
    if (!setup) return console.error('Database not initialized')

    let sw = new window.SharedWorker(swSetURL)
    sw.port.onmessage = function (e) {
      if (typeof fn === 'function') {
        if (e.data) fn(e.data)
        else fn()
      }
      sw.port.close()
    }
    sw.port.postMessage({action: 'set', key, value})
  }

  exp.getItem = function (key, fn) {
    if (!setup) return console.error('Database not initialized')

    let sw = new window.SharedWorker(swSetURL)
    sw.port.onmessage = function (e) {
      if (typeof fn === 'function') {
        fn(e.data.err, e.data.res)
      }
      sw.port.close()
    }
    sw.port.postMessage({action: 'get', key})
  }

  exp.removeItem = function (key, fn) {
    if (!setup) return console.error('Database not initialized')

    let sw = new window.SharedWorker(swSetURL)
    sw.port.onmessage = function (e) {
      if (typeof fn === 'function') {
        if (e.data) fn(e.data)
        else fn()
      }
      sw.port.close()
    }
    sw.port.postMessage({action: 'remove', key})
  }

  exp.clear = function (fn) {
    if (!setup) return console.error('Database not initialized')

    let sw = new window.SharedWorker(swSetURL)
    sw.port.onmessage = function (e) {
      if (typeof fn === 'function') {
        if (e.data) fn(e.data)
        else fn()
      }
      sw.port.close()
    }
    sw.port.postMessage({action: 'clear'})
  }

  exp.length = function (fn) {
    if (!setup) return console.error('Database not initialized')

    let sw = new window.SharedWorker(swSetURL)
    sw.port.onmessage = function (e) {
      if (typeof fn === 'function') {
        if (e.data.err) fn(e.data.err, null)
        else fn(null, e.data.res)
      }
      sw.port.close()
    }
    sw.port.postMessage({action: 'count'})
  }


  // events
  let events = new Map()

  exp.on = function (key, fn) {
    if (events.has(key)) { // if there are listeners for key
      let values = events.get(key) // get the current array of callback functions
      values.push(fn) // add the new callback function
      events.set(key, values) // replace the old callback function array
    }
    else { // if key has no listeners, create it
      events.set(key, [fn])
    }
  }

  exp.off = function (key, fn) {
    if (events.has(key)) { // if there are listeners for key
      let values = events.get(key) // get the current array of callback functions
      for (let i = 0; i < values.length; i++) {
        if (values[i] == fn) {
          values.splice(i, 1)
          break;
        }
      }
      events.set(key, values) // replace the old callback function array
    }
  }

  exp.emit = function(key, data) {
    if (events.has(key)) {
      let callbacks = events.get(key) // gets an array of callback functions
      callbacks.forEach(function (fn) {
        fn(data)
      } )
    }
  }

  return exp
})()
