/** @module chiarbot */
const commands = require('./command');
const channels = require('./channel');
const fs = require('fs/promises');
const tmi = require('tmi.js');
const utils = require('./utils');
const auth = require("./auth");
const { WhisperEnvironment, ChatEnvironment } = require('./commandenv');
const { reloadChannelEmotes: loadEmotes, reloadGlobalEmotes: loadGlobalEmotes } = require('./emotes');
const { setChannelCooldown, setGlobalPerma, testChannelCooldowns, testGlobalFilters } = require('./cooldowns');
const { PartiQLUpdate, AWS_ENABLED } = require('./awsutils');
const {info : log} = require("winston");

var client;

/** 
 * @typedef {import("../chiarbot").Channel} Channel
 * @typedef {import("../chiarbot").Command} Command
 * @typedef {import("../chiarbot").WhisperCommand} WhisperCommand
 * @typedef {import("../chiarbot").User} User
 * @typedef {import("../chiarbot").CoolPredicate} CoolPredicate
 * @typedef {import("tmi.js").Client} Client
 */

if (process.argv.length - 2 == 2 && process.argv[2] == "--oauth") {
    auth(process.argv[3]);
} else {
    auth();
}

const CONNECT_BOT = auth.RETRIEVE_TOKENS.then(async () => {
    log(`Trying connection to IRC`);
    const OPTIONS = {
        identity: {
            username: process.env.USERNAME,
            password: `oauth:${auth.IRC_PASSWORD}`
        }
    };

    /** @type {Client} */
    client = new tmi.Client(OPTIONS);

    client.on('chat', onChatHandler);
    client.on('whisper', onWhisperHandler)

    client.on('timeout', (channel, username, reason, duration, userstate) => {
        if (username == process.env.USERNAME) {
            log(`* timed out for ${duration} seconds xd`);
        }
    });
    client.on('notice', (channel, msgid, message) => { log(message) });
    client.on('ban', (channel, username) => {
        log(`\u001b[31;1m${username} has been banned.\u001b[0m`)
    });

    return await client.connect();
})

const GET_CHANNEL_SETTINGS = AWS_ENABLED ? readChannelsettingsFromDataBase() : fs.readFile('./channelsettings.json', 'utf-8').then(str => JSON.parse(str))
const CREATE_CHANNELS = GET_CHANNEL_SETTINGS.then(settings => {
    settings.forEach((channelSettings, i) => {
        // create channel
        let newChannel = new channels.create('#' + channelSettings.name, channelSettings.id, channelSettings.settings)

        // load channel emotes
        setTimeout(() => {
            loadEmotes(newChannel).all.then(() => { log(`local emotes loaded for channel: ${newChannel.name}`); })
        }, i * 100)
    })
})

// start joining channels when channels have been loaded and bot connected to chat 
Promise.all([CONNECT_BOT, CREATE_CHANNELS]).then(([[addr, port]]) => {
    log(`* Connected to ${addr}:${port}.`);
    // to keep within join limit, join a channel every 2 seconds
    channels.list.forEach((ch, i) => {
        setTimeout(() => {
            client.join(ch.name).then(() => {
                log(`joined channel: ${ch.name}`);
            })
        }, 2000 * i);
    })
})

// load global emotes
auth.RETRIEVE_TOKENS.then(() => {
    loadGlobalEmotes().all.then((responses) => {
        let badResponse = responses.findIndex(r => !r.success)
        if (badResponse == -1) {
            log('all emote requests succeeded');
        } else {
            log(['twitch', 'ffz', 'bttv'][badResponse] + 'request failed');
        }
    })
})

async function readChannelsettingsFromDataBase() {
    const { Items: items } = await PartiQLUpdate('select * from "ChannelSettings"')
    return items.map(i => {
        return {
            name: i.Username.S,
            id: i.TwitchID.N,
            settings: {
                banphraseApiURL: i.BanphraseAPIURL?.S,
                connected: i.Connected?.BOOL,
                coolTime: i.CoolTime?.N,
                queueTime: i.QueueTime?.N,
                messageLength: i.MessageLength?.N,
                muteWhenOnline: i.MuteWhenOnline?.BOOL,
                tags: i.Tags?.SS,
            }
        }
    })
}

/**
 * recursive function to send a message in the channel every few seconds
 * @param {Channel} channel
 */
function sendMessageQueue(channel) {
    if (channel.queue.length != 0) {
        let message = channel.queue.shift();
        client.say(channel.name, message);
        log('* sent [' + message + ']')
        setTimeout(() => { sendMessageQueue(channel) }, channel.queueTime)
    } else {
        // end the chatting queue if it is empty
        channel.isQueuing = false
        log('queue ended')
    }
}

/** 
 * @callback chat - sends a message to a specified channel
 * 
 * @param {string} message - message to be sent
 * @param {Channel|string} toChannel - the Channel to send the message to
 * @param {boolean} [needCheckApi=false] - whether the bot should check against the channel's banphrase API to prevent timeouts
 * @param {number} [maxLength] - the maximum length of the message that is to be sent; the rest of the message is cut off
 */

/** @type {chat} */
function chat(message, toChannel, needCheckApi = false, lengthOverride = 0) {
    log('* sending... ' + message)
    if (typeof (toChannel) == 'string') {
        toChannel = channels.get(toChannel)
    }
    let maxLength = lengthOverride || toChannel.messageLength
    let chatFinal = () => {
        // if there are repeated messages add the special invisible character
        if (message === toChannel.lastMessage && (Date.now() - toChannel.timeOfLastMessage < 30000)) {
            message = message + ' 󠀀'
        }
        if (message != '') {
            toChannel.queue.push(message)
            // log(toChannel.isQueuing)
            if (!toChannel.isQueuing) {
                toChannel.isQueuing = true
                sendMessageQueue(toChannel)
            }
            toChannel.lastMessage = message;
            toChannel.timeOfLastMessage = Date.now();
        }
    }

    if (/^(\/|\.)(?!(me|w)\s)/.test(message)) {
        message = 'no pajaCMON'
        needCheckApi = false
    }
    // if the message is too long, allow the message to be cut off at a space, within a tolerance of 20 characters
    if (message.length > maxLength) {
        // allow the message to be cut off to include a word, within a certain tolerance
        let cutoffIndex = message.indexOf(' ', maxLength)
        if (cutoffIndex == -1) cutoffIndex = message.length
        if (cutoffIndex - maxLength < 20) {
            message = message.slice(0, cutoffIndex)
        } else {
            message = message.slice(0, maxLength).trim()
        }
    }
    message = message.slice(0, maxLength)
    if (needCheckApi) {
        utils.checkApi(toChannel, message, function () {
            message = 'banned by api monkaS'
            chatFinal()
        }, function () {
            chatFinal()
        })
    } else {
        message = message.replace(/8766/gi, '𝚁𝙴𝙳𝙰𝙲𝚃𝙴𝙳')
        chatFinal()
    }
}

/**
 * @callback respond chat but in the same channel so i don't need to specify the channel  every time
 * @param {string} response message to be sent
 * @param {...any} args the needcheckApi and maxLength properties
 */

/**
 * 
 * @param {string} target the name of the channel where the message was sent e.g. #forsen
 * @param {User} user info about the user
 * @param {string} msg the message
 * @param {boolean} self whether the message was sent by the bot
 */
function onChatHandler(target, user, msg, self) {

    // remove the invisible thing chatterino users use
    msg = msg.replace(/^󠀀+/, '').replace(/󠀀$/, '')
    let message = msg.trim();
    let wordArray = message.split(' ')
    // get the channel object from the name
    let channel = channels.get(target)
    /** @type {respond} */
    let respond = function (response, ...args) {
        chat(response, channel, ...args)
    }
    // get the command name and retrieves the command object
    let commandName = wordArray[0].slice(1)
    let command = commands.get(commandName)
    if (command) {
        /**
         * A method for setting bot cooldowns that accepts a time and predicate that looks at the environment that the message was sent in (userstate, command and channel). If the predicate evaluates to true, the command is not triggered
         * @param {number} [time] - time in milliseconds
         * @param {CoolPredicate} [predicate] - If evaluates to true, do not trigger the command. Defaults to one that evaluates to true when the same user tries to use the same command in the same channel
         */
        function cool(time = 4000, ...args) {

            if (args.length == 1 && typeof args[0] == 'function') {
                // "advanced" cooldown, set a predicate
                setChannelCooldown(channel, env => args[0](env.user, env.command, env.channel), time, 'custom channel cooldown')
            } else if (args.length == 0) {
                // if no arguments, just set a timeout for that user for the same command in that channel
                setChannelCooldown(channel, (env) => env.user.username == user.username && env.channel == channel && env.command.names.some(n => command.names.includes(n)), undefined, 'cooldown generated by command: ' + command.names[0])
            }

            // set a global cooldown preventing all users in the channel from spamming commands
            setChannelCooldown(channel, () => true, channel.coolTime, 'global cooldown on channel: ' + channel.name)
        }
        let env = new ChatEnvironment(channel, user, command, message, client, cool, respond)

        // first, look through a channel's filters
        let filter = testChannelCooldowns(channel, env)
        if (filter) {
            log('channel command denied: ' + filter.failText);
        } else {
            // then, look through globally set filters
            filter = testGlobalFilters(env)
            if (filter) {
                if (filter.failText == 'dev-only command') {
                    respond('That is a developer command! pepeLaugh')
                    cool(30000)
                } else if (filter.failText == '')
                    log('command denied: ' + filter.failText);
            } else {
                let extraArgs = env.parser.read(command.process.length - 1)
                command.process(env, ...extraArgs)
                log(`\n* command detected:  ${commandName}\n  modifiers:         ${extraArgs.join(', ')}\n  trailing sentence: ${env.parser.rest()}\n`)
            }
        }
    }
    let { pyramid } = channel
    if ((new Set(wordArray)).size === 1) {
        let level = wordArray.length;
        let word = wordArray[0];
        if (word != pyramid.word) {
            pyramid.reset()
            // log('1')
            pyramid.word = word
        } else if (pyramid.level - level === -1 && pyramid.status === 1) {
            pyramid.height = level;
            pyramid.users.add(user.username)
        } else if (pyramid.level - level === 1) {
            pyramid.users.add(user.username)
            if (pyramid.status === 1) {
                pyramid.status = 2;
            }
            if (pyramid.status === 2) {
                if (level === 1 && pyramid.height > 2) {
                    pyramid.users.add(user.username)
                    log(pyramid.height, 'tall', pyramid.word, 'pyramid detected. Participants: ', pyramid.users);
                    if (pyramid.users.size === 1) {
                        log(user['display-name'] + ' just soloed a pyramid')
                    }
                    pyramid.reset();
                    // log('2')
                    pyramid.word = word
                }
                if (level === 2 && utils.weebEmotes.includes(word)) {
                    user.username = '';
                    if (!(['#forsen', '#nymn'].includes(channel.name))) respond('NaM 🖕')
                }
            }
        } else {
            pyramid.reset();
            // log('3')
            pyramid.word = word
        }
        if (level === 1) {
            pyramid.status = 1
            pyramid.users.add(user.username)
        }
        // log('pyramidStatus: ' + pyramidStatus)
        pyramid.level = level
    } else {
        pyramid.reset();
        // log('4') 
    }
    if (/just\sget\sa\shouse/i.test(message) && channel.houseId && !self) {
        clearInterval(channel.houseId)
        channel.houseId = undefined
        respond('4House LOOOOOOOOOOOOOOOOOOOL')
    } else if (message == 'pong! 🏓 ppHop 🏓' && user.username == 'botderjc') {
        respond('botderjc Kissahomie')
    } else if (message == '+join' && user.username == 'chiaryan') {
        respond('+join')
    }
}

/**
 * 
 * @param {string} from - username that whispered you
 * @param {User} user - info about the user
 * @param {string} message - message in the whisper
 * @param {boolean} self - whether the whisper was sent by the bot
 */
function onWhisperHandler(from, user, message, self) {

    message = message.trim();
    let wordArray = message.split(' ')

    /** 
     * whisper a message to the same user
     * @type {(response: string) => void}*/
    let respond = function (response) {
        client.whisper(user.username, response)
    }
    let commandName = wordArray[0].slice(1)
    /** @type {WhisperCommand} */
    let command = commands.getWhisperedCommand(commandName)
    if (command) {
        let failText
        // detecting and executing a command
        if (!command.prefixes.includes(wordArray[0][0])) failText = 'invalid prefix'
        else if (command.devCommand && !['chiaryan', 'ryannamnamchia'].includes(user.username)) {
            respond('That is a developer command! pepeLaugh')
            failText = 'command is dev-only'
        } else {
            /** @type {import("../chiarbot").WhisperEnvironment} */
            let env = new WhisperEnvironment(user, command, message, client, respond, chat)
            let extraArgs = env.parser.read(command.process.length - 1)
            command.process(env, ...extraArgs)
            log(`\n* whispered command detected:  ${commandName}\n  modifiers:         ${extraArgs.join(', ')}\n  trailing sentence: ${env.sentence}\n`)
        }
        if (failText) {
            log('whispered command denied: ' + failText)
        }
    }
    log(`\u001b[30;1m${from} whispered: ${message}\u001b[0m`)
}