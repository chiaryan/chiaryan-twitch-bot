const { Command, get: getCommandByName} = require('../lib/command')

const BOT_PREFIX = "^"

new Command('help', function ({ respond, cool }, commandName) {
  if (!commandName) {
    return;
  }
  
  // if the user enters sth like '^help ^specimen' instead of '^help specimen', remove the '^' for them
  if (commandName[0] === BOT_PREFIX) {
    commandName = commandName.slice(1);
  }

  let command = getCommandByName(commandName);

  if (!commandName) {
    respond('command not found monkaS');
    cool(3000);
    return;
  }
}, { helpText: 'Usage: ^help <command>. Provides details on how to use the command' })
