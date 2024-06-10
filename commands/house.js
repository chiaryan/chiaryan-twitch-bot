const { Command } = require('../lib/command');

new Command('house', function (bot) {
    bot.respond('How is somebody homeless? 4HEad');
    bot.cool();
    clearTimeout(bot.channel.houseId);
    bot.channel.houseId = setTimeout(() => {
        bot.respond(`JUST GET A HOUSE ${bot.f('4House')} LOOOOOOOOOOOOOOOOOOOL`);
        bot.channel.houseId = undefined;
    }, 15000);
}, { helpText: 'JUST GET ONE 4House LOOOOOOOOOOOOOOOOOOOOOL', prefixes: '!' });
