const { Command } = require('../lib/command');

new Command('enatoin', function (bot) {
  bot.respond('/me AUTSITIC NATOIN 👌 4HEad');
  bot.cool(7000); 
}, { prefixes: '!' });
