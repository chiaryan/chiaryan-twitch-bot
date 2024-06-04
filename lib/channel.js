/**@module channel */
/** @typedef {import('../chiarbot').Channel} Channel */
const assert = require('assert')
const {PartiQLUpdate, PartiQLStringify, awsEnabled} = require('./awsutils')
const {info : log} = require("winston");

// properties on the channel that are modifiable
const CHANNELPROPS = [
    {propName: 'id', dbName: 'TwitchID', dbType: 'S'},
    {propName: 'name', dbName: 'Username', dbType: 'S'},
    {propName: 'banphraseApiURL', dbName: 'BanphraseAPIURL', dbType: 'S'},
    {propName: 'excludedCommands', dbName: 'ExcludedCommands', dbType: 'SS'},
    {propName: 'coolTime', dbName: 'CoolTime', dbType: 'N'},
    {propName: 'queueTime', dbName: 'QueueTime', dbType: 'N'},
    {propName: 'messageLength', dbName: 'MessageLength', dbType: 'N'},
    {propName: 'muteWhenOnline', dbName: 'MuteWhenOnline', dbType: 'BOOL'},
    {propName: 'connected', dbName: 'Connected', dbType: 'BOOL'},
    {propName: 'tags', dbName: 'Tags', dbType: 'SS'}
]


/**@type {Channel[]} */
var list = []
/**
 * @constructor 
 * @param {string} name - the name of the channel, prefixed with a #.
 * @param {string} id - the numerical user ID of the channel, as a string.
 * @param {Object} [options] - the settings to override the channel's default settings
 * @param {string[]} [options.excludedCommands] - the commands that are not allowed to be used in this channel
 * @param {string[]} [options.tags] - classifying tags
 * @param {string} [options.banphraseApiURL] - the Banphrase API url that the bot will use to check for banphrases
 * @param {number} [options.coolTime] - the global cooldown for the channel in milliseconds
 * @param {number} [options.queueTime] - the time interval for the bot to send queued messages in milliseconds
 * @param {boolean} [options.muteWhenOnline] - whether the bot should mute when the channel goes live
 * @param {boolean} [options.connected] - whether the bot should be connected to Twitch IRC - the bot should part with/connect to the IRC channel when this is toggled 
 */
function create(name, id, options = {}) {
    assert(/^\d+$/.test(id), 'ID provided is not a numerical string')
    assert(name[0] == '#', 'channel name does not start with #')
    this.id = id
    this.name = name

    this.banphraseApiURL = options.banphraseApiURL ?? '';
    this.excludedCommands = options.excludedCommands ?? []
    this.coolTime = options.coolTime ?? 1500
    this.queueTime = options.queueTime ?? 1000
    this.messageLength = options.messageLength ?? 400
    this.muteWhenOnline = options.muteWhenOnline ?? false
    this.tags = options.tags ?? [];
    this.connected = options.connected ?? true

    this.lastMessage = '',
    this.timeOfLastMessage = 0,
    this.timeOfLastCommand = 0,
    this.queue = []
    this.isQueuing = false
    this.muted = false
    this.cooldowns = []
    this.emotes = {
        bttv:[],
        ffz:[]
    }

    this.pyramid = {
        level: 0,
        height: 0,
        word: '',
        status: 0, // 0 = none, 1 = ascending, 2 = descending
        users: new Set(),
        reset() {
            this.level = 0
            this.height = 0
            this.word = ''
            this.status = 0
            this.users.clear()
        }
    }
    list.push(this)
}
 
/**
 * takes name of channel, returns channel object. returns undefined if no channel is found.
 * @param {string} name name of the property of the channel
 * @param {string} property the channel property you want to search by
 * @returns {Channel | undefined}
 */
function get(name, property = 'name') {
    // in case we want to get using other properties
    if (name && property == 'name' && name[0] != '#') {
        name = '#' + name
        // adds a # if we forgot one
    }
    // gets the 1st channel object that satisfies the condition
    return list.find(ch => ch[property] == name)
}
/**
 * removes a channel from the channel list and returns it. if there is no matching channel found, returns undefined.
 * @param {string} name - the name of the channel
 * @param {any} [property] - the property to search the channels by
 */
function remove(name, property) {
    if (name && property == 'name' && name[0] != '#') {
        name = '#' + name
    }
    if (property != undefined) {
        var index = list.findIndex(ch => ch.name == name)
    } else {
        var index = list.findIndex(ch => ch[property] == name) 
    }
    if (index == -1) {
        return undefined
    } else {
        let [channel] = list.splice(index,1)
        return channel
    }
}

/**
 * changes a modifiable property of the channel bot-side and updates the channel's data database-side
 * @param {Channel} channel 
 * @param {string} propertyName 
 * @param {any} value 
 */
function modifyChannelProperty(channel, propertyName, value) {
    let prop = CHANNELPROPS.find(p => p.dbName == propertyName)
    if (prop.propName == 'id') {
        throw new Error('Cannot modify property "TwitchID" of a channel')
    }
    if (prop) {
        let badType = false
        switch (prop.dbType) {
            case 'S':
                badType = typeof value == 'string'
                break;
            case 'N':
                badType = typeof value == 'number'
                break;
            case 'BOOL':
                badType = typeof value == 'boolean'
                break;
            case 'SS':
                badType = value.every(e => typeof e == 'string')
                break;
            case 'NS':
                badType = value.every(e => typeof e == 'number')
                break;
            default:
                badType = true
                break;
        }
        if (!badType) {
            // set the property internally
            channel[prop.propName] = value
            // change the property on DB
            if (awsEnabled) {
                PartiQLUpdate(`update "ChannelSettings" set "${prop.dbName}" = ${PartiQLStringify(value)} where "TwitchID" = ${channel.id}`)
            }
        } else {
            throw new Error(`Value ${value} does not match channel property type "${prop.dbType}"`)
        }
    } else {
        throw new Error(`Invalid channel property "${propertyName}"`)
    }
} 


if (awsEnabled) {
    /**
     * helper function to copy the attributes of a channel from the database side onto a channel used by the bot 
     * @param {{[key: string]: import('@aws-sdk/client-dynamodb').AttributeValue}} dbData - a channel settings item from the DynamoDB query output 
     * @param {Channel} channel the Channel on the bot
     */
    function copyDBOnto(dbData, channel) {
        for (const attribute in dbData) {
            let property = CHANNELPROPS.find(p => p.dbName == attribute)
            // get the raw value of the item, as defined by the AWS SDK
            let value = dbData[attribute][property.dbType]
    
            // transform the value into a JavaScript suitable number
            // if (property.dbType == 'N') value = Number(value)
            // set the channel's property
            channel[property.propName] = value
    
        }
    }
    /**
     * update bot-side channel data from the database-side
     * @param {Channel|string} [channel] name of the channel/the channel object
     */
    async function reloadChannelProperties(channel) {
        if (channel) {
            if (typeof channel == 'string') channel = get(channel)
            const {Items: [dbData]} = await PartiQLUpdate(`select * from "ChannelSettings" where "TwitchID" = ${channel.id}`)
            copyDBOnto(dbData, channel)
        } else {
            // if no channel was provided, update the data for all channels that the database appears to have.
            // this does not check whether the channels in the database are the same as in the bot.
            const {Items: channelSettingsItems} = await PartiQLUpdate(`select * from "ChannelSettings"`)
            channelSettingsItems.forEach(dbItem => {
                let botChannel = get(NumberdbItem.TwitchID.N, 'id') 
                if (botChannel) {
                    log('channel found in database that is not found on bot; may be a new channel.');
                } else {
                    copyDBOnto(dbItem, botChannel)
                }
            })
        }
    }

    /**
     * compares the current channel list with the channels present in the database.
     * it then adds new channel objects/removes channel objects in order to make sure the channels bots-side are the same database side.
     * 
     */
    async function cleanChannelList() {
        const {Items: dbChannelList} = await PartiQLUpdate(`select * from "ChannelSettings"`)
        // copy of the original list of channels
        const botChannelList = list.slice()

        // check each item in the database list
        dbChannelList.forEach(dbChannel => {
            const botChannelIndex = botChannelList.findIndex(ch => ch.id = dbChannel.TwitchID.N)
            if (botChannelIndex == -1) {
                let channelOptions = {}
                copyDBOnto(dbChannel, channelOptions)
                // create the new channel if it is present in the database bot not bot-side
                new create(dbChannel.ChannelName.S, dbChannel.TwitchID.N, channelOptions)
            } else {
                // take the channel out of the "copied" list if it's already there
                botChannelList.splice(botChannelIndex, 1)
            }
        })
        // then, remove all remaining channels in the "copied" list, that are in the bot-side list but not the database-side
        for (const removeChannel of botChannelList) {
            remove(removeChannel.id, 'id')
        }
    }
    /**
     * compares the bot-side channels with the channels on the IRC connection - joins and parts from channels in order both sides are the same
     * @param {import('tmi.js').Client} tmiClient - the tmi.js client to access IRC functions
     */
    function checkConnectedChannels(tmiClient) {
        var currentIRCChannels = tmiClient.getChannels()
        list.forEach(botChannel => {
            const ircChannelIndex = currentIRCChannels.findIndex(n => n == botChannel.name)
            if (ircChannelIndex == -1) {
                tmiClient.join(botChannel.name)
            } else {
                currentIRCChannels.splice(ircChannelIndex, 1)
            }
            for (const disconnectChannel of currentIRCChannels) {
                tmiClient.part(disconnectChannel)
            }
        })
    }


}

module.exports = {
    list,
    create,
    get,
    remove,
    CHANNELPROPS,
}

if (awsEnabled) {
    module.exports.modifyChannelProperty = modifyChannelProperty;
    module.exports.reloadChannelProperties = reloadChannelProperties;
    module.exports.cleanChannelList = cleanChannelList;
    module.exports.checkConnectedChannels = checkConnectedChannels;
}