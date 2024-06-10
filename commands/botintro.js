const { Command } = require('../lib/command');
const BOT_TEXT = 'I\'m a bot made by chiaryan to do useless things FeelsDankMan Do ^commands to see what I can do';

function response(bot) {
  bot.respond(BOT_TEXT);
  bot.cool(10000);
};

new Command(['spergbot02', 'chiarbot'], response, { prefixes: '!' });

new Command('bot', response);
