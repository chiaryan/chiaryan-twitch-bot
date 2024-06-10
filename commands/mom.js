const { Command } = require('../lib/command');

function isSelf(victimLowerCase, bot) {
    return [bot.user.username, bot.user["display-name"]].includes(victimLowerCase);
}
function isForsen(victimLowerCase) {
    return victimLowerCase === "forsen";
}
function isMe(victimLowerCase) {
    return ['chiarbot', 'chiaryan', 'spergbot02'].includes(victimLowerCase);
}
function isMod(victimLowerCase) {
    return ['pajlada', 'swiftapple', 'tr1dentify', 'shuristr', 'ampzyh', 'landon144', 'noobberry', 'kawaqa'].includes(victimLowerCase);
}
function appendEmote(victimLowerCase) {
    return isSelf(victimLowerCase, bot) ? bot.f("KKonaW")
        : isForsen(victimLowerCase) ? "forsenSWA UNLUCKY"
        : isMe(victimLowerCase) ? "FeelsDankMan wtf"
        : isMod(victimLowerCase) ? `${bot.f('PepeS')} OH GOD OH FUCK WHAT HAVE YOU DONE?!`
        : bot.f('4HEad');
}
new Command('mom', function (bot, victim) {
    let append;
    if (!victim) {
        bot.respond('You need to provide a name first ' + bot.f('4HEad'));
        bot.cool(3000);
        return;
    }

    append = appendEmote(victim.toLowerCase());

    bot.respond(`${bot.user['display-name']} fucked ${victim}\'s mom. ${append}`, true);
    bot.cool();
    return;
}, { helpText: 'Fucks someone\'s mom 4HEad', weebBanned: true });
