/** @module chiarbot */
const commands = require('./command')
const channels = require('./channel')
const fs = require('fs/promises')
const tmi = require('tmi.js')
const utils = require('./utils')
const {WhisperEnvironment, ChatEnvironment} = require('./commandenv')
const {reloadChannelEmotes: loadEmotes, reloadGlobalEmotes: loadGlobalEmotes} = require('./emotes')
const {setChannelCooldown, setGlobalPerma, testChannelCooldowns, testGlobalFilters} = require('./cooldowns')
const { PartiQLUpdate, awsEnabled } = require('./awsutils')
const qs = require('querystring')

module.exports.IRC_PASSWORD = "pepege";

var REFRESH_TOKEN;

// promises
var TOKENS_RETRIEVED;
var client;

 /** 
  * @typedef {import("../chiarbot").Channel} Channel
  * @typedef {import("../chiarbot").Command} Command
  * @typedef {import("../chiarbot").WhisperCommand} WhisperCommand
  * @typedef {import("../chiarbot").User} User
  * @typedef {import("../chiarbot").CoolPredicate} CoolPredicate
  * @typedef {import("tmi.js").Client} Client
 */

/**
 * In the event that the user access token is expired, refresh the token using client secret
 * @returns {Promise<void>}
 */
async function refreshAccessToken() {
    const query = qs.stringify({ 
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: REFRESH_TOKEN
    })
    const {message, status, access_token: token} = await utils.httpRequest({
        hostname: "id.twitch.tv",
        path: `/oauth2/token?${query}`,
        method: 'POST'
    }, true)
    if (status == 400 && message == "Invalid refresh token") {
        const url = qs.encode({
            client_id: process.env.CLIENT_ID,
            redirect_uri: "http://localhost:3000",
            response_type: "code",
            scope: "chat:read chat:edit",
        });
        console.error(`Refresh token invalid. Please create a new one through this link https://id.twitch.tv/oauth2/authorize?${url}`);
        process.exit(1);
    }
    console.log(`Got access token ${token}`);
    module.exports.IRC_PASSWORD = token;
    writeAccessTokens();
    
}

async function readAuthTokens() {
    const {irc_token, refresh_token} = JSON.parse(await fs.readFile("./data/token.json"));
    if (irc_token == undefined || refresh_token == undefined) {
        console.error("bad ./data/token.json format");
        process.exit(1);
    }
    module.exports.IRC_PASSWORD = irc_token;
    REFRESH_TOKEN = refresh_token;
    console.log(`Read access token for password: ${irc_token}`)
    console.log(`Read refresh token: ${refresh_token}`)
}

async function getAuthTokens(OAUTH_CODE) {
    const {status, data, message} = await require("axios")({
        method: "post",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        url: "https://id.twitch.tv/oauth2/token",
        params: { 
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          code: OAUTH_CODE,
          grant_type: "authorization_code",
          redirect_uri: "http://localhost:3000"
        }
    })

    if (status != 200) {
        throw Error(message);
    }

    module.exports.IRC_PASSWORD = data["access_token"];
    REFRESH_TOKEN = data["refresh_token"];

    console.log(`Got access token from auth code: ${module.exports.IRC_PASSWORD}`)
    console.log(`Got refresh token from auth code: ${REFRESH_TOKEN}`)
    writeAccessTokens();
}

function writeAccessTokens() {
    fs.writeFile("./data/token.json", JSON.stringify({
        "irc_token": module.exports.IRC_PASSWORD,
        "refresh_token": REFRESH_TOKEN 
    }))
}

function tryConnectToIrc() {
    const OPTIONS = {
        identity: {
            username: process.env.USERNAME,
            password: `oauth:${module.exports.IRC_PASSWORD}`
        }
    };

    /** @type {Client} */
    client = new tmi.Client(OPTIONS);

    client.on('chat', onChatHandler);
    client.on('whisper', onWhisperHandler)

    client.on('timeout', (channel, username, reason, duration, userstate) => {
        if (username == process.env.USERNAME) {
            console.log(`* timed out for ${duration} seconds xd`);
        }
    });
    client.on('notice', (channel, msgid, message) => {console.log(message)});
    client.on('ban', (channel, username) => {
        console.log(`\u001b[31;1m${username} has been banned.\u001b[0m`)
    });

    return client.connect();
}

if (process.argv.length - 2 == 2 && process.argv[2] == "--oauth") {
    const OAUTH_CODE = process.argv[3];
    TOKENS_RETRIEVED = getAuthTokens(OAUTH_CODE);
} else {
    TOKENS_RETRIEVED = readAuthTokens().then(() => {
        console.log(`Validating token`)
        return utils.httpRequest({
            hostname: "id.twitch.tv",
            path: "/oauth2/validate",
            headers: {
                "Authorization": `OAuth ${exports.IRC_PASSWORD}`
            }
        }, true).then(({"status": status}) => {
            if (status == 401) {
                return refreshAccessToken();
            }
        });
    })
}
const BOT_CONNECTED = TOKENS_RETRIEVED.then(async () => {
    console.log(`Trying connection to IRC`)
    return await tryConnectToIrc();
    // try {
    // } catch (error) {
    //     console.log(`Error connecting to client. Reason: ${error}`);
    //     await refreshAccessToken();
    //     console.log(`Retrying connection to IRC`);
    //     return await tryConnectToIrc();
    // }
})

if (awsEnabled) {
    var channelsSettingsLoaded = PartiQLUpdate('select * from "ChannelSettings"').then(({Items: items}) => {
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
    })
} else {
    var channelsSettingsLoaded = fs.readFile('./channelsettings.json', 'utf-8').then(str => JSON.parse(str))
}
// array of channels, specified by id, that have special settings
// we need to create a request to Twitch to get the names of the channels to connect to chat
const channelsLoaded = channelsSettingsLoaded.then(settings => {
    settings.forEach((channelSettings, i) => {
        // create channel
        let newChannel = new channels.create('#' + channelSettings.name, channelSettings.id, channelSettings.settings)

        // load channel emotes
        setTimeout(() => {
            loadEmotes(newChannel).all.then(() => {console.log(`local emotes loaded for channel: ${newChannel.name}`);})
        }, i * 100)
    })
})

// start joining channels when channels have been loaded and bot connected to chat 
Promise.all([BOT_CONNECTED,channelsLoaded]).then(([[addr,port]]) => {
    console.log(`* Connected to ${addr}:${port}.`);
    // to keep within join limit, join a channel every 2 seconds
    channels.list.forEach((ch,i) => {
        setTimeout(() => {
            client.join(ch.name).then(() => {
                console.log(`joined channel: ${ch.name}`);
            })
        }, 2000 * i);
    })
})

// load global emotes
TOKENS_RETRIEVED.then(() => {
    loadGlobalEmotes().all.then((responses) => {
        let badResponse = responses.findIndex(r => !r.success)
        if (badResponse == -1) {
            console.log('all emote requests succeeded');
        } else {
            console.log(['twitch','ffz','bttv'][badResponse] + 'request failed');
        }
    })
})

/**
 * recursive function to send a message in the channel every few seconds
 * @param {Channel} channel
 */
function sendMessageQueue(channel) {
    if (channel.queue.length != 0) {
        let message = channel.queue.shift();
        client.say(channel.name, message);
        console.log('* sent [' + message + ']')
        setTimeout(() => { sendMessageQueue(channel) }, channel.queueTime)
    } else {
        // end the chatting queue if it is empty
        channel.isQueuing = false
        console.log('queue ended')
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
    console.log('* sending... ' + message)
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
            // console.log(toChannel.isQueuing)
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
    msg = msg.replace(/^󠀀+/,'').replace(/󠀀$/,'')
    let message = msg.trim();
    let wordArray = message.split(' ')
    // get the channel object from the name
    let channel = channels.get(target)
    /** @type {respond} */
    let respond = function(response, ...args) {
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
                setChannelCooldown(channel, (env) => env.user.username == user.username && env.channel == channel&& env.command.names.some(n => command.names.includes(n)), undefined, 'cooldown generated by command: ' + command.names[0])
            }

            // set a global cooldown preventing all users in the channel from spamming commands
            setChannelCooldown(channel, () => true, channel.coolTime, 'global cooldown on channel: '+ channel.name) 
        }
        let env = new ChatEnvironment(channel, user, command, message, client, cool, respond)

        // first, look through a channel's filters
        let filter = testChannelCooldowns(channel, env)
        if (filter) {
            console.log('channel command denied: ' + filter.failText);
        } else {
            // then, look through globally set filters
            filter = testGlobalFilters(env)
            if (filter) {
                if (filter.failText == 'dev-only command') {
                    respond('That is a developer command! pepeLaugh')
                    cool(30000)
                } else if (filter.failText == '')
                console.log('command denied: ' + filter.failText);
            } else {
                let extraArgs = env.parser.read(command.process.length - 1)
                command.process(env, ...extraArgs)
                console.log(`\n* command detected:  ${commandName}\n  modifiers:         ${extraArgs.join(', ')}\n  trailing sentence: ${env.parser.rest()}\n`)
            }
        }
    }
    let {pyramid} = channel
    if ((new Set(wordArray)).size === 1) {
        let level = wordArray.length;
        let word = wordArray[0];
        if (word != pyramid.word) {
            pyramid.reset()
            // console.log('1')
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
                    console.log(pyramid.height, 'tall', pyramid.word, 'pyramid detected. Participants: ', pyramid.users);
                    if (pyramid.users.size === 1) {
                        console.log(user['display-name'] + ' just soloed a pyramid')
                    }
                    pyramid.reset();
                    // console.log('2')
                    pyramid.word = word
                }
                if (level === 2 && utils.weebEmotes.includes(word)) {
                    user.username = '';
                    if (!(['#forsen','#nymn'].includes(channel.name))) respond('NaM 🖕')
                }
            }
        } else {
            pyramid.reset();
            // console.log('3')
            pyramid.word = word
        }
        if (level === 1) {
            pyramid.status = 1
            pyramid.users.add(user.username)
        }
        // console.log('pyramidStatus: ' + pyramidStatus)
        pyramid.level = level
    } else {
        pyramid.reset();
        // console.log('4') 
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
            console.log(`\n* whispered command detected:  ${commandName}\n  modifiers:         ${extraArgs.join(', ')}\n  trailing sentence: ${env.sentence}\n`)
        }
        if (failText) {
            console.log('whispered command denied: ' + failText)
        }
    }
    console.log(`\u001b[30;1m${from} whispered: ${message}\u001b[0m`)
}