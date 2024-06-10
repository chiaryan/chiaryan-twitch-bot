const { Command } = require('../lib/command');

new Command('commands', function (bot, opt) {
    if (opt == 'weebs') {
        bot.respond(`Commands: huntweebs, cagedweebs, killweebs, deadweebs, tortureweebs, freeweebs, weebrank, weebslayers. Do ^help 𝘤𝘰𝘮𝘮𝘢𝘯𝘥 for more info`);
    } else {
        bot.respond(`Commands: glitch interspace fancify unicodesearch specimen braille mom yourmom hangman wife. Do ^help 𝘤𝘰𝘮𝘮𝘢𝘯𝘥 for info. For dealing with weebs, do ^commands weebs`);
    }
    bot.cool(7000);
});
