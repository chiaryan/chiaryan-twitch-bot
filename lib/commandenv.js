const {create: Channel} = require('./channel')
const assert = require('assert')
const {emoteFallback} = require('./emotes')

/**
 * 
 * @param {string} text 
 */
const parser = function (text) {
    let ptr = 1
    let wordArray = text.split(' ')
    /**
     * 
     * @param {number} [num] read the next num words in the message and return them as an array, and advance the pointer num times
     * if a number is not passed, returns the first word as a string
     */
    function read(num) {
        if (num == undefined) {
            return wordArray[ptr++]
        } else {
            return wordArray.slice(ptr, ptr += num)
        }
    }
    /**
     * 
     * @param {number} [num] read the next num words in the message and return them as an array, WITHOUT advancing the pointer
     * if a number is not passed, returns the first word as a string
     */
    function tell(num) {
        if (num == undefined) {
            return wordArray[ptr]
        } else {
            return wordArray.slice(ptr, ptr + num)
        }
    }
    /**
     * 
     * @param {number} num set the pointer position
     */
    function seek(num) {
        ptr = num
    }
    /**
     * return the rest of the of the message from the pointer onwards.
     */
    function rest() {
        return wordArray.slice(ptr).join(' ')
    }
    return {
        read,
        tell,
        seek,
        rest
    }
}
/** a generic interface for command environments */
class Environment {
    constructor(command, text) {
        assert(typeof text == 'string')
        this.command = command
        this.parser = parser(text)
        this.respond = function () {}
        this.cool = function() {}
    }
}
/** to be consumed by a command called in a twitch chatroom */
class ChatEnvironment extends Environment {
    constructor(channel, user, command, text, client, cool, respond) {
        assert(channel instanceof Channel)
        super(command, text)
        this.user = user
        this.client = client
        this.cool = cool
        this.respond = respond
        this.channel = channel
        this.f = emote => emoteFallback(channel, emote) 
    }
}
/** to be consumed by a command called in the bot's whispers */
class WhisperEnvironment extends Environment {
    constructor(user, command, text, client, respond, chat) {
        super(command, text)
        this.user = user
        this.client = client
        this.respond = respond
        this.client = client
        this.chat = chat
    }
}
/** consumed while testing commands */
class DebugEnvironment extends Environment {
    constructor(command, text) {
        super(command, text)
        this.user = {
            username: 'chiaryan',
            "user-id": '180782930',
            "display-name": 'ChiaRy丹n',
            mod: true,
            subscriber: true,
            "room-id": '180782930'
        }
        this.respond = console.log
        this.channel = new Channel('#chiaryan', '180782930')
        this.chat = function(channel, text) { console.log(`message in ${channel.name}: ${text}`);}
    }
}
module.exports = {ChatEnvironment, Environment, DebugEnvironment, WhisperEnvironment}