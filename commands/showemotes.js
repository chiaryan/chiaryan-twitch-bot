const { Command } = require('../lib/command');
const globalEmotes = require('../lib/emotes');
const channels = require('../lib/channel');

new Command('globalemotes', function (bot) {
    let message = 'the global emotes are: ' + globalEmotes.all.join(' ');
    let i = 0;
    for (let j = 400; message.length > j; j += 450) {
        j = message.slice(0, j).lastIndexOf(' ');
        bot.respond(message.slice(i, j), undefined, 450);
        i = j + 1;
    }
    bot.respond(message.slice(i), undefined, 450);
    bot.cool(30000);
}, { tags: ['emote'] });

new Command('ffzemotes', function (bot) {
    let channel = channels.get(bot.parser.read() || ' ') || bot.channel;
    let message = `The FFZ emotes in this channel are: ${channel.emotes.ffz.join(' ')}`;
    let i = 0;
    for (let j = 400; message.length > j; j += 450) {
        j = message.slice(0, j).lastIndexOf(' ');
        bot.respond(message.slice(i, j), undefined, 450);
        i = j + 1;
    }
    bot.respond(message.slice(i), undefined, 450);
    bot.cool(30000);
}, { tags: ['emote'] });

new Command('bttvemotes', function (bot) {
    let channel = channels.get(bot.parser.read() || ' ') || bot.channel;
    let message = `The BTTV emotes in this channel are: ${channel.emotes.bttv.join(' ')}`;
    let i = 0;
    for (let j = 400; message.length > j; j += 450) {
        j = message.slice(0, j).lastIndexOf(' ');
        bot.respond(message.slice(i, j), undefined, 450);
        i = j + 1;
    }
    bot.respond(message.slice(i), undefined, 450);
    bot.cool(30000);
}, { tags: ['emote'] });