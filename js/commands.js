
// implement points here as a Map, send points to dynamic commands and static commands
module.exports = (function () {
  const commandSymbol = '!'

  let bot = require('../lib/tapic-bot')

  let commandList = new Map()

  let fs = require('fs')
  const commandsPath = './commands/'
  fs.readdir(commandsPath, function (err, files) {
    if (err) console.error(err)
    if (!files) console.error(err)
    for (let f = 0; f < files.length; f++) {
      const commandName = files[f].split('.')[0]
      commandList.set(commandName, require('.' + commandsPath + files[f]))
    }
  })

  bot.listen('message', res => {
    if (res.action || res.text.substring(0,1) !== commandSymbol) return null
    let textArray = res.text.split(' ')
    let commandKeyword = textArray.shift().substring(1)
    let text = textArray.join(' ')
    if (commandList.has(commandKeyword)) {
      let command = commandList.get(commandKeyword) //(text, res.from, res.mod, res.sub)
      if (command.type === 'dynamic') {
        runDynamicCommand(command, text, res.from, res.mod, res.sub)
      }
      else if (command.type === 'static') {
        command.run(text, res.from, res.mod, res.sub)
      }
    }
  })

  function runDynamicCommand(command, text, username, mod, sub) {
    // check permissions
    // replace wildcards with the appropriate tokens
    // output the string
  }

  // dynamicCommand = {
  //   type: 'dynamic',
  //   requireMod: true,
  //   requireSub: false,
  //   requirePoints: 0,
  //   action: '',
  // }
})()
