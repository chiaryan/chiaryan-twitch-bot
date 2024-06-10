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
    return isSelf(victimLowerCase, bot) ? bot.f("Kapp")
        : isForsen(victimLowerCase) ? "forsenSWA UNLUCKY"
        : isMe(victimLowerCase) ? "FeelsDankMan wtf"
        : isMod(victimLowerCase) ? `${bot.f('PepeS')} OH GOD OH FUCK WHAT HAVE YOU DONE?!`
        : 'forsenCD';
}
new Command('wife', function (bot, victim) {
    let append;
    if (!victim) {
        bot.respond('You need to provide a name first forsenCD');
        bot.cool(3000);
        return;
    }

    append = appendEmote(victim.toLowerCase());

    bot.respond(`${bot.user['display-name']} fucked ${victim}\'s wife. ${append}`, true);
    bot.cool();
    return;
}, { helpText: 'Fucks someone\'s wife. forsenCD', weebBanned: true });
