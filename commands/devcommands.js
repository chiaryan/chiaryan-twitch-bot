const {Command, WhisperedCommand} = require('../lib/command')
const {create: Channel, get: getChannel, checkConnectedChannels, cleanChannelList: syncChannels, modifyChannelProperty, reloadChannelProperties, CHANNELPROPS} = require('../lib/channel')
const { PartiQLUpdate, awsEnabled } = require('../lib/awsutils')
const utils = require('../lib/utils')
const { spawn } = require('child_process')

new Command('commandtest', function (bot, a, b) {
    bot.respond(`modifiers: ${Array.from(arguments).slice(1).join(',')}, trailing sentence: ${bot.sentence}, username: ${bot.user['display-name']}, channel: ${bot.channel.name}`, true)
})

function mute({channel, respond}) {
    respond(`channel ${channel.name} has been muted`)
    channel.muted = true
}

function unmute({channel, respond}) {
    channel.muted = false
    respond(`channel ${channel.name} has been unmuted`)
}
function shutdown({respond}) {
    respond('󠀀...Why? FeelsBadMan 🔫')
    process.exit()
}
function restart({respond}) {
    respond('󠀀...But why? FeelsBadMan 🔫')
    spawn('node', ['-r', 'dotenv/config', 'index.js', 'aws'], {detached: true, stdio: 'ignore'}).unref()
    process.exit()
}
function echo({parser: {rest}, respond}) {
    if (rest() != '') {
        respond(rest())
    } else {
        respond('...')
    }
}

function excludeWeeb({parser: {read}, respond}) {
    let excludeUser = read()
    if (excludeUser) {
        respond('Error, did not specify user monkaS')
    } else {
        utils.weebUsers.push(excludeUser.toLowerCase());
        respond(`user ${excludeUser} is banned from this bot FeelsOkayMan 👍`)
    }
}

function setChannelProperty({parser: {read, rest}, respond}) {
    let propertyName = read()
    let value = rest()

    if (propertyName) {
        let property = CHANNELPROPS.find(prop => prop.propName == propertyName)
        if (property) {
            
        } else {
            respond(`error: no property '${propertyName}' found monkaS`)
        }
        
    } else {
        respond('error: no property given monkaS')
    }

    modifyChannelProperty(channel, read(), value)
}

async function execPQLQuery({parser: {rest}}) {
    let statementOutput = await PartiQLUpdate(rest())
    
}

new Command('dev', function(bot) {
    const { parser: {
        read, rest
    }, channel, respond} = bot
    switch (read()) {
        case 'mute':
            mute(bot)
            break;
        case 'unmute':
            unmute(bot)
            break;
        case 'shutdown':
            shutdown(bot)
            break;
        case 'restart':
            restart(bot)
        case 'echo':
            echo(bot)
            break;
        case 'exclude':
            excludeWeeb(bot)
            break;
        case 'hangman': 
            if (channel.hangman.isRunning) {
                switch (read()) {
                    case 'stop':
                        channel.hangman.reset()
                        clearTimeout(channel.hangman.timeout)
                        break;
                    case 'reveal':
                        respond('hangman timed out FeelsDankMan the phrase was: ' + channel.hangman.phrase)
                        channel.hangman.reset()
                        clearTimeout(channel.hangman.timeout)
                        break;
                    default:
                        respond('hangman command not found FeelsWeirdMan')
                        break;
                }
            } else {
                respond('hangman isn\'t even running dumbass LULW')
            }
            break;
        case 'reloademotes':
            let name = read()
            let reloadingChannel = channels.get(name)
            if (name == 'global') {
                // reload global emotes
                globalEmotes.reloadGlobalEmotes().all.then(function([twitch, ffz, bttv]) {
                    let allSucceeded = true
                    if (!twitch.success) {
                        respond('error getting twitch emotes monkaS')
                        allSucceeded = false
                    }
                    if (!bttv.success) {
                        respond('error getting bttv emotes monkaS')
                        allSucceeded = false
                    }
                    if (!ffz.success) {
                        respond('error getting ffz emotes monkaS')
                        allSucceeded = false
                    }
                    if (allSucceeded) {
                        respond('global emotes reloaded')
                        console.log('reloaded global emotes')
                    }
                })
            } else if (name == 'all') {
                // if invalid channel or 'all', reload ALL channel emotes
                // create a promise that resolves when bttv and ffz emotes in all channels have loaded
                Promise.all(channels.list.map(ch => {
                    let request = globalEmotes.reloadChannelEmotes(ch)
                    request.bttv.then(res => {
                        if (!res.success) {
                            respond(`bttv request failed for channel: ${ch.name.slice(1)}`)
                        }
                    })
                    request.ffz.then(res => {
                        if (!res.success) {
                            respond(`ffz request failed for channel: ${ch.name.slice(1)}`)
                        }
                    })
                    return request.all
                })).then(() => {
                    respond('reloaded emotes for all channels')
                })

            } else {
                // get the current channel if nothing or an invalid channel id provided
                reloadingChannel = reloadingChannel || channel
                // if the name of a channel is provided, reload that channel only, then write the new data to channeldata.json
                let request = globalEmotes.reloadChannelEmotes(reloadingChannel)
                request.bttv.then(res => {
                    if (!res.success) {
                        respond(`bttv request failed monkaS`)
                    }
                })
                request.ffz.then(res => {
                    if (!res.success) {
                        respond(`ffz request failed monkaS`)
                    }
                })
                request.all.then(() => {
                    respond('reloaded emotes for channel: ' + reloadingChannel.name.slice(1))
                })
            }
            break;
        default:
            respond('command not found FeelsWeirdMan')
            break;
    }
}, {devCommand: true, tags: ['dev']})

new WhisperedCommand('dev', function ({parser: {
    read, rest, seek
}, respond, ...bot}) {
    switch (read()) {
        case 'shutdown':
            respond('󠀀...Why? FeelsBadMan 🔫')
            process.exit(1)
        case 'restart':
            respond('󠀀...But why? FeelsBadMan 🔫')
            spawn('node', ['-r', 'dotenv/config', 'index.js', 'aws'], {detached: true, stdio: 'ignore'}).unref()
            process.exit()
        case 'respond':
            respond(rest())
            break;
        case 'memory':
            let mem = process.memoryUsage()
            respond(Object.keys(mem).map(key => `${key}: ${(mem[key]/1024/1024).toPrecision(2)} MB`).join(', '))
            break;
        case 'update-channel-property': 
            let channel = getChannel(read())
            let propertyName = read()

            let newValue = rest()
            if (!channel) {
                seek(2)
                respond(`error: channel "${read()}" not found monkaS`)
            } else if (!propertyName) {
                respond('error: channel property name was not given monkaS')
            } else if (!newValue) {
                respond(`error: no value given to update property "${propertyName}"`)
            } else {
                try {
                    modifyChannelProperty(channel, propertyName, newValue)
                } catch(error) {
                    respond(error.message)
                }

            }
        case 'leavechannel':
            let leavingChannel = channels.get(read())
            if (leavingChannel) {
                // disconnect the bot from the channel and remove it from the channels list
                bot.client.part(leavingChannel.name)
                let res = channels.remove(leavingChannel.name)
                if (res.found) {
                    respond(`channel removed: ${res.channel}`)
                }
            } else {
                respond('channel not found monkaS')
            }
            break;
        case 'joinchannel': 
            let channelName = read()
            // channelName must have a # at the start
            if (/^#\w+$/.test(channelName)) {
                // check if the channel already exists
                if (!channels.get(channelName)) {
                    utils.httpRequest({
                        hostname: 'api.twitch.tv',
                        path: '/helix/users/?login=' + channelName.slice(1),
                        headers: {
                            'Client-ID': process.env.CLIENT_ID,
                            'Authorization': 'Bearer ' + process.env.APP_ACCESS_TOKEN
                        }
                    }, true).then(({data:[chDatum]}) => {
                        
                        if (!chDatum) {
                            respond('channel not found in twitch catalogue monkaS')
                        } else {
                            // create a new channel for them
                            const newChannel = new channels.create(channelName, chDatum.id)
                            // connect to the channel on Twitch IRC
                            bot.client.join(newChannel.name)
                            // load the channels's emotes
                            globalEmotes.reloadChannelEmotes(newChannel).all.then(([bttv, ffz]) => {
                                let reportString = ''
                                if (bttv.success) {
                                    reportString += `bttv request succeeded. ${bttv.emotes.length} emotes added. `
                                } else {
                                    reportString += 'bttv request failed.'
                                }
                                if (ffz.success) {
                                    reportString += `ffz request succeeded: ${bttv.emotes.length} emotes added. `
                                } else {
                                    reportString += 'ffz request failed.'
                                }
                                respond(reportString)
                            })
                        }
                    })
                } else {
                    respond('error, channel already exists monkaS')
                }

            } else {
                respond('error, invalid channel name')
            }
            break
        default:
            respond('command not found FeelsWeirdMan')
            break;
    }
}, {devCommand: true})