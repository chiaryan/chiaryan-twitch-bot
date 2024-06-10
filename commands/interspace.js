const { Command } = require('../lib/command');
const utils = require('../lib/utils');
const globalEmotes = require('../lib/emotes');
var BIG_EMOTES = ['FishMoley', 'bttvNice', 'AngelThump', 'TaxiBro', 'SexPanda', 'YetiZ', 'FireSpeed', 'DuckerZ']

new Command(['is', 'interspace'], function ({ parser: { rest }, ...bot }, word) {
    let sentence;
    let output;
    if (!word) {
        bot.respond('you have to include a word FeelsDankMan');
        bot.cool(3000);
        return;
    }

    sentence = rest();

    if (!sentence) {
        bot.respond('You have to provide a sentence too');
        bot.cool(3000);
        return;
    }

    if (utils.weebEmotes.includes(word)) {
        word = 'PedoBear';
    }
    
    output = ($` ${sentence} `).replace(/ /g, ` ${word} `).trim();

    if (BIG_EMOTES.includes(word)) {
        bot.respond(output, true, 90);
        bot.cool();
        return;
    }
    
    if (globalEmotes.all.includes(word)) {
        if (word == 'NaM') {
            output += ' ARRIVEDERCI NaM 👌';
        }
        bot.respond(output, true, 250);
        bot.cool();
        return;
    }
    
    bot.respond(output, true);
    bot.cool();
    return;
}, { helpText: 'interspace/is: 👏Takes👏the👏following👏word👏and👏inserts👏it👏in👏between👏every👏word👏of👏the👏sentence👏after👏it.👏', weebBanned: true });
