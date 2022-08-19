 /** 
  * @typedef {import("../chiarbot").Command} Command
  * @typedef {import("../chiarbot").CommandProcess} CommandProcess
  * @typedef {import("../chiarbot").WhisperCommand} WhisperCommand
  * @typedef {import("../chiarbot").WhisperProcess} WhisperProcess
 */

/**@type {Command[]} */
var list = []

class _create {
    constructor(names, process, properties = {}) {
        this.names = Array.isArray(names) ? names : [names];
        this.process = process;
        this.devCommand = false;
        this.weebBanned = false;
        Object.assign(this, properties);
        if (!this.prefixes) {
            // if prefixes are unspecified, make the list ['^']
            this.prefixes = ['^'];
        }
        else if (Array.isArray(this.prefixes)) {
            // if the prefixes are given as an array, add a '^' to it
            this.prefixes.push('^');
        }
        else {
            // else, aka the input is a string, put it in an array and add '^' to it
            this.prefixes = [this.prefixes].concat('^');
        }
    }
}

/**
 * @extends _create
 */
class _Command extends _create {
    /**
     * creates a command object and adds it to the command array
     * @param {string|string[]} names - Either a command name or an array of aliases that trigger the command
     * @param {CommandProcess} process - a function that is called when the command is triggered
     * @param {Object} properties - some options to apply to the command
     * @param {string} properties.helpText - text that shows info on the command. shown when ^help is used.
     * @param {boolean} properties.weebBanned - whether a user on the weeb banlist is allowed to use the bot
     * @param {boolean} properties.devCommand - whether the command is only usable by a dev.
     * @param {string[]|string} properties.prefixes - what other prefixes are used for the bot other than ^
     * @param {Array<"emote"|"weebhunt">} properties.tags - classifying tags for internal usage
     */
    constructor(names, process, properties = {}) {
        super(names, process)
        this.helpText = ''
        Object.assign(this, properties)
        list.push(this)
    }
}


/** @type {WhisperCommand[]} */
var whisperedList = []
/**
 * returns a WhisperedCommand object when given the name of the command
 * @param {string} name - name of the command
 * @returns {WhisperCommand}
 */
function getWhisperedCommand(name) {
    return whisperedList.find(wh => wh.names.includes(name) || wh.names == name)
}

/** @extends _create */
class WhisperedCommand extends _create {
    /**
     * creates a command that is triggered through whispers and adds it to the whispered commands array
     * @param {string|string[]} names - Either a command name or an array of aliases that trigger the command
     * @param {WhisperProcess} process - a function that is called when the command is triggered
     * @param {Object} properties - some options to apply to the command
     * @param {boolean} properties.weebBanned - whether a user on the weeb banlist is allowed to use the command
     * @param {boolean} properties.devCommand - whether the command is only usable by a dev.
     * @param {string[]|string} properties.prefixes - what other prefixes are used for the bot other than ^
     */
    constructor(names, process, properties = {}) {
        super(names, process)
        Object.assign(this, properties)
        whisperedList.push(this)
    }
}
/**
 * returns a Command object when given the name of the command
 * @param {string} name - name of the command
 * @returns {Command | undefined}
 */

function get(name) {
    return list.find(cm => cm.names.includes(name) || cm.names == name)
}
module.exports = {
    list, Command: _Command, get, WhisperedCommand, whisperedList, getWhisperedCommand
}