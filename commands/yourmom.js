const { Command } = require('../lib/command');
const utils = require('../lib/utils');
const axios = require('axios');

new Command(['yourmom', 'ym'], function (bot, name) {
    axios.get("http://www.laughfactory.com/jokes/yo-momma-jokes/" + String(Math.ceil(Math.random() * 50))).then(response => {
        let jokes = response.data.match(/<p\sid="joke_\d+">\r\n.+<\/p>/g).map(j => j.match(/\s{3,}.+\s{3,}/)[0].trim());
        jokes = jokes.map(j => j.replace(/^yo(ur)?\sm(o|a)m{1,2}a?s?('s)?(\sis)?/i, 'Your mom is').replace(/<br>/g, ''));
        let joke = utils.pickOne(jokes);
        while (/\sso\sblack/.test(joke)) {
            joke = utils.pickOne(jokes);
        }
        bot.respond(`${name ? name : bot.user['display-name']}, ${joke} ${(bot.channel.name == '#vesp3r') ? 'forsenHead' : bot.f('4HEad')}`, true);
    });
    bot.cool();
}, { weebBanned: true, helpText: 'yourmom/ym: Gets a (terrible) your mom joke. 4HEad' });
