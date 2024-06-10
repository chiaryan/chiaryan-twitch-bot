const { Command } = require('../lib/command');

new Command('cookie', function (bot) { 
  bot.respond('?cookie'); 
});
