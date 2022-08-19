const {Command, WhisperedCommand, ...command} = require('../lib/command')
const utils = require('../lib/utils')
const axios = require('axios')
const globalEmotes = require('../lib/emotes')
const channels = require('../lib/channel')
const { spawn } = require('child_process')
// var botUsers = ['pajbot']
var bigEmotes = ['FishMoley', 'bttvNice', 'AngelThump', 'TaxiBro', 'SexPanda', 'YetiZ', 'FireSpeed', 'DuckerZ']
// const bigEmotesButNaM = bigEmotes.concat('NaM')
const botText = 'I\'m a bot made by chiaryan to do useless things FeelsDankMan Do ^commands to see what I can do'
new Command('help', function ({respond, cool}, commandName) {
    if (commandName) {
        if (commandName[0] === '^') { commandName = commandName.slice(1) }
        let cmd = command.get(commandName)
        if (cmd) {
            if (cmd.helpText) {
                respond(cmd.helpText)
                cool()
            }
        } else {
            respond('command not found monkaS')
            cool(3000)
        }
    } else {

    }
}, { helpText: 'Usage: ^help <command>. Provides details on how to use the command' })
//Type ^commands for a list of my commands. Type ^help <command> for info on how to use a command
new Command('channels',function ({respond, cool}) {
    respond(`FeelsDankMan I am currently connected to these channels: ${channels.list
        // adds a zero-width character to not ping them
        .map(ch => ch.name.slice(1,2) + '󠀀' + ch.name.slice(2))
        .join(', ')}`)
    cool(40000)
})

new Command('specimen', function ({respond, cool, f}) {
    let spec1 = utils.pickOne('S', 'SH')
    let spec2 = utils.pickOne('E', 'EE', 'I')
    let spec3 = utils.pickOne('C', 'SH')
    let spec4 = utils.pickOne('I', 'E', 'U')
    let specimen = spec1 + 'P' + spec2 + spec3 + 'IM' + spec4 + 'N'
    respond((specimen === 'SPECIMEN' ? 'forsenGOW' : f('forsenGa')) + ' ' + specimen)
    cool(2500)
}, { helpText: 'Generates a random specimen forsenGa' })

new Command(['glitch', 'gl'], function ({parser: {rest}, cool, respond}) {
    let text = rest()
    if (text) {
        let glitchedText = '';
        for (let i = 0; i < text.length; i++) {
            if (text[i] === ' ') {
                glitchedText += '▒'
            } else {
                glitchedText += text[i]
            }
            glitchedText += '҉'
        }
        respond('▒҉' + glitchedText + '▒҉', true);
        cool()
    } else { 
        respond('You have to input text to ▒҉g҉l҉i҉t҉c҉h҉▒҉ first')
        cool(3000) 
    }
}, { helpText: 'glitch/gl: Glitches the following sentence ▒҉l҉i҉k҉e҉▒҉t҉h҉i҉s҉▒҉', weebBanned: true })
new Command(['is','interspace'], function ({parser: {rest}, ...bot}, word) {
    if (word) {
        let text = rest()
        if (text) {
            if (utils.weebEmotes.includes(word)) {
                word = 'PedoBear'
            }
            let output = (' ' + text + ' ').replace(/ /g, ` ${word} `).trim();
            if (bigEmotes.includes(word)) {
                bot.respond(output, true, 90)
            } else if (globalEmotes.all.includes(word)) {
                if (word == 'NaM') {output = output + ' ARRIVEDERCI NaM 👌'}
                bot.respond(output, true, 250)
            } else {
                bot.respond(output, true)
            }
            bot.cool()
        } else {
            bot.respond('You have to provide a sentence too')
            bot.cool(3000)
        }
    } else {
        bot.respond('you have to include a word FeelsDankMan')
        bot.cool(3000)
    }
}, { helpText: 'interspace/is: 👏Takes👏the👏following👏word👏and👏inserts👏it👏in👏between👏every👏word👏of👏the👏sentence👏after👏it.👏', weebBanned: true })

new Command(['unicodesearch','us'], function ({parser:{rest}, ...bot}) {
    let query = rest()
    if (!query) {
        bot.respond('You need to specify search term(s) first')
        bot.cool(3000)
    } else {
        axios.get(`https://www.fileformat.info/info/unicode/char/search.htm?q=${query}&preview=entity`).then(response => {
            let searchResults = ''
            let page = response.data;
            let page2 = page.slice(page.search('<table class="table table-list table-striped">'))
            let tableString = page2.slice(0, page2.search('</table>'))
            for (let charIndex = 0; charIndex < tableString.length; charIndex++) {
                if (tableString.slice(charIndex, charIndex + 2) === 'U+') {
                    let charCode = ''
                    for (let searchIndex = charIndex + 2; tableString[searchIndex] != '<'; searchIndex++) {
                        charCode += tableString[searchIndex];
                    }
                    searchResults += ' ' + String.fromCodePoint(parseInt(charCode, 16))
                }
            }
            if (searchResults.length === 0) {
                bot.respond('no matches found monkaS')
                bot.cool()
            } else {
                if (searchResults.length >= 140) {
                    searchResults = searchResults.slice(0,140)
                }
                // if (bot.sentence.toLowerCase() == 'nam') {
                //     let num = Math.floor(Math.random() * 139)
                //     searchResults = searchResults.slice(0,num) + ' NaM ' + searchResults.slice(num)
                // }
                bot.respond('matches found! ' + searchResults, true)
            } 
        })
        bot.cool()
    }
}, { helpText: 'unicodesearch/us: Takes the following search term and searches a database for matching unicode symbols', weebBanned: true })

new Command(['yourmom', 'ym'], function(bot, name) {
    axios.get("http://www.laughfactory.com/jokes/yo-momma-jokes/" + String(Math.ceil(Math.random() * 50))).then(response => {
        let jokes = response.data.match(/<p\sid="joke_\d+">\r\n.+<\/p>/g).map( j => j.match(/\s{3,}.+\s{3,}/)[0].trim())
        jokes = jokes.map(j => j.replace(/^yo(ur)?\sm(o|a)m{1,2}a?s?('s)?(\sis)?/i,'Your mom is').replace(/<br>/g,''))
        let joke = utils.pickOne(jokes)
        while (/\sso\sblack/.test(joke)) {
            joke = utils.pickOne(jokes)
        }
        bot.respond(`${name ? name : bot.user['display-name']}, ${joke} ${(bot.channel.name == '#vesp3r') ? 'forsenHead' : bot.f('4HEad')}`,true)
    })
    bot.cool()
},{weebBanned: true, helpText: 'yourmom/ym: Gets a (terrible) your mom joke. 4HEad'})

new Command('ffzemotes', function (bot) {
    let channel = channels.get(bot.parser.read() || ' ') || bot.channel
    let message = `The FFZ emotes in this channel are: ${channel.emotes.ffz.join(' ')}`
    let i = 0
    for (let j = 400; message.length > j; j += 450) {
        j = message.slice(0,j).lastIndexOf(' ')
        bot.respond(message.slice(i,j), undefined, 450)
        i = j + 1
    }
    bot.respond(message.slice(i), undefined, 450)
    bot.cool(30000)
}, {tags:['emote']})

new Command('bttvemotes', function (bot) {
    let channel = channels.get(bot.parser.read() || ' ') || bot.channel
    let message = `The BTTV emotes in this channel are: ${channel.emotes.bttv.join(' ')}`
    let i = 0
    for (let j = 400; message.length > j; j += 450) {
        j = message.slice(0,j).lastIndexOf(' ')
        bot.respond(message.slice(i,j), undefined, 450)
        i = j + 1
    }
    bot.respond(message.slice(i), undefined, 450)
    bot.cool(30000)
},{tags: ['emote']})

new Command('globalemotes', function (bot) {
    let message = 'the global emotes are: ' + globalEmotes.all.join(' ')
    let i = 0
    for (let j = 400; message.length > j; j += 450) {
        j = message.slice(0,j).lastIndexOf(' ')
        bot.respond(message.slice(i,j), undefined, 450)
        i = j + 1
    }
    bot.respond(message.slice(i), undefined, 450)
    bot.cool(30000)
}, {tags:['emote']})

new Command(['spergbot02', 'chiarbot'], function (bot) { bot.respond(botText); bot.cool(10000) }, { prefixes: '!' })
new Command('bot', function (bot) { bot.respond(botText); bot.cool(10000) })
new Command('commands', function (bot, opt) {
    if (opt == 'weebs') {
        bot.respond(`Commands: huntweebs, cagedweebs, killweebs, deadweebs, tortureweebs, freeweebs, weebrank, weebslayers. Do ^help 𝘤𝘰𝘮𝘮𝘢𝘯𝘥 for more info`)
    } else {
        bot.respond(`Commands: glitch interspace fancify unicodesearch specimen braille mom yourmom hangman wife. Do ^help 𝘤𝘰𝘮𝘮𝘢𝘯𝘥 for info. For dealing with weebs, do ^commands weebs`)
    }
    bot.cool(7000) 
})
new Command('house', function (bot) {
    bot.respond('How is somebody homeless? 4HEad')
    bot.cool()
    clearTimeout(bot.channel.houseId)
    bot.channel.houseId = setTimeout(() => {
        bot.respond(`JUST GET A HOUSE ${bot.f('4House')} LOOOOOOOOOOOOOOOOOOOL`)
        bot.channel.houseId = undefined
    }, 15000)
}, { helpText: 'JUST GET ONE 4House LOOOOOOOOOOOOOOOOOOOOOL', prefixes: '!' })
new Command('enatoin', function (bot) { bot.respond('/me AUTSITIC NATOIN 👌 4HEad'); bot.cool(7000) }, { prefixes: '!' })
new Command('anime', function (bot) { bot.respond('🤮🤮🤮🤮🤮🤮🤮🤮🤮🤮🤮🤮🤮🤮🤮🤮🤮🤮🤮🤮🤮') ; bot.cool(2000)}, { prefixes: '!' })

new Command('cookie', function (bot) { bot.respond('?cookie') })
new Command(['ping','bing','ding','ting'], async function ({parser:{seek, read}, f, ...bot}) {
    let message = ''
    // go to the very first word to check what command was used
    seek(0)
    switch (read().slice(1)) {
        case 'ping':
            message = 'OH ZOINKS YOU JUST GOT FLIPPIN\' PONGED NaM '
            break;
        case 'bing':
            message = `BONG ${f('WAYTOODANK')} `
            break;
        case 'ding':
            message = 'DONG gachiGASM '
            break;
        case 'ting':
            message = `TONG ${f('pajaDank')} 🔔 `
            break;
        default:
            break;
    }
    bot.client.ping().then(latency => {
        bot.respond(message + ` ${latency * 1000} ms`)
        bot.cool(3000)
    })
})
new Command('mom', function (bot, victim) {
    if (victim) {
        let appendEmote = ''
        switch (victim.toLowerCase()) {
            case bot.user.username:
            case bot.user["display-name"]:
                appendEmote = bot.f('KKonaW')
                break;
            case 'forsen':
                appendEmote = 'forsenSWA'
                break;
            case 'chiarbot':
            case 'chiaryan':
            case 'spergbot02':
                appendEmote = 'FeelsDankMan wtf'
                break;
            case 'pajlada':
            case 'swiftapple':
            case 'tr1dentify':
            case 'shuristr':
            case 'ampzyh':
            case 'landon144':
            case 'noobberry':
            case 'kawaqa':
                appendEmote = bot.f('PepeS') + ' OH GOD OH FUCK WHAT HAVE YOU DONE?!'
                break;
            default:
                appendEmote = bot.f('4HEad')
        }
        bot.respond(bot.user['display-name'] + ' fucked ' + victim + '\'s mom. ' + appendEmote, true)
        bot.cool()
    } else {
        bot.respond('You need to provide a name first ' + bot.f('4HEad'))
        bot.cool(3000)
    }
}, { helpText: 'Fucks someone\'s mom 4HEad', weebBanned: true })

new Command('wife', function(bot, victim) {
    if (victim) {
        let appendEmote = ''
        switch (victim.toLowerCase()) {
            case bot.user.username:
            case bot.user["display-name"]:
                appendEmote = bot.f('Kapp')
                break;
            case 'forsen':
                appendEmote = 'forsenSWA'
                break;
            case 'chiarbot':
            case 'chiaryan':
            case 'spergbot02':
                appendEmote = 'FeelsDankMan wtf'
                break;
            case 'pajlada':
            case 'swiftapple':
            case 'tr1dentify':
            case 'shuristr':
            case 'ampzyh':
            case 'landon144':
            case 'noobberry':
            case 'kawaqa':
                appendEmote = bot.f('PepeS') + ' OH GOD OH FUCK WHAT HAVE YOU DONE?!'
                break;
            default:
                appendEmote = 'forsenCD'
        }
        bot.respond(bot.user['display-name'] + ' fucked ' + victim + '\'s wife. ' + appendEmote, true)
        bot.cool()
    } else {
        bot.respond('You need to provide a name first forsenCD')
        bot.cool(3000)
    }
}, { helpText: 'Fucks someone\'s wife. forsenCD', weebBanned: true })

