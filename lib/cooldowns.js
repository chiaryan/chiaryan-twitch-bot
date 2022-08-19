/**
 * @typedef {import('../chiarbot').ChatEnvironment} ChatEnvironment
 * @typedef {import('../chiarbot').Channel} Channel
 * @typedef {import('../chiarbot').Filter} Filter
 */

/**
 * @callback Predicate
 * @param {ChatEnvironment} env
 * @returns {boolean}
 */

/**
 * @type {Filter[]}
 */
var globalFilters = []

/** generic interface for a filter */
class Filter {
    constructor(predicate, failText = '') {
        /**
         * test the environment. returns a boolean
         * @param {ChatEnvironment} env
         * @returns {boolean}
         */
        this.test = env => !!predicate(env)
        this.failText = failText
        this.isPerma = true
        this.timeout = undefined;
        // we want to create a unique id for this filter so we can refer to it later
    }
}

/** a filter in the global scope */
class GlobalFilter extends Filter {
    /**
     * 
     * @param {Predicate} predicate 
     * @param {string} [failText] 
     */
    constructor(predicate, failText = '') {
        super(predicate, failText)
        let possibleIDs = [...Array(globalFilters.length + 1).keys()]
        for (let i = 0; i < globalFilters.length; i++) {
            let currID = globalFilters[i].id;
            possibleIDs = possibleIDs.filter(n => n != currID)
        }
        this.id = possibleIDs[0]
        globalFilters.push(this)
    }
}

/** a filter in the scope of a channel */
class ChannelFilter extends Filter {
    /**
     * 
     * @param {Predicate} predicate 
     * @param {Channel} channel 
     * @param {string} [failText] 
     */
    constructor(predicate, channel, failText = '') {
        super(predicate,failText)
        let possibleIDs = [...Array(channel.cooldowns.length + 1).keys()]
        for (let i = 0; i < channel.cooldowns.length; i++) {
            let currID = channel.cooldowns[i].id;
            possibleIDs = possibleIDs.filter(n => n != currID)
        }
        this.id = possibleIDs[0]
    }
}
/**
 * create a global temporary filter that expires after some time, aka a cooldown
 * @param {Predicate} predicate 
 * @param {number} coolTime 
 * @param {string} [failText] 
 */
function setGlobalCooldown(predicate, coolTime = 4000, failText = '') {
    let filter = new GlobalFilter(predicate, failText) 
    filter.isPerma = false
    filter.timeout = setTimeout(() => {
        // set a timeout to remove the predicate
        let i = globalFilters.findIndex(pr => pr == filter)
        globalFilters.splice(i,1)
    }, coolTime);
    return filter
}

/**
 * add a permanent global filter to the global collection
 * @param {Predicate} predicate 
 * @param {string} failText 
 */
function setGlobalPerma(predicate, failText = '') {
    return new GlobalFilter(predicate,failText)
}

/**
 * remove the predicate at the specified index. returns true if a predicate has been found and removed
 * @param {number} index this index of the filter to remove 
 * @returns {boolean} 
 */
function removeGlobalFilter(id) {
    let index = globalFilters.findIndex(f => f.id == id)
    if (index == -1) {
        return false
    } else {
        let filter = globalFilters[index]
        if (!filter.isPerma) {
            clearTimeout(filter.timeout)
        }
        globalFilters.splice(index,1)
        return true
    }
}

/**
 * Tests the given chat environment against the globally set filters. returns the filter that catches the env, else returns false.
 * @param {ChatEnvironment} env the chat environment to test
 * @returns {Filter|false}
 */
function testGlobalFilters(env) {
    for (let i = 0; i < globalFilters.length; i++) {
        const predicate = globalFilters[i];
        try {
            var passed = predicate.test(env)
        } catch (error) {
            console.log('Invalid filter: ' + error.message);
        } finally {
            env.parser.seek(1)
            if (passed) return predicate
        }
    }
    return false
}
/**
 * add a global filter by specifying the function statements of the predicate. Returns an error if there is invalid function syntax
 * @param {string} text 
 * @returns {GlobalFilter|Error}
 */
function setFilterString(text, failText = 'custom filter') {
    try {
        var predicate = new Function('channel', 'user', 'command', 'env', text)
    } catch (error) {
        return error
    }
    let filter = setGlobalPerma(env => predicate(env.channel, env.user, env.command, env), failText)
    return filter
}

/**
 * add a cooldown tied to a channel
 * @param {Channel} channel the channel to add the filter to
 * @param {Predicate} predicate 
 * @param {number} coolTime
 * @param {string} failText
 */
function setChannelCooldown(channel, predicate, coolTime = 4000, failText = '') {
    let filter = new ChannelFilter(predicate, channel, failText)
    channel.cooldowns.push(filter)
    filter.timeout = setTimeout(() => {
        let index = channel.cooldowns.findIndex(f => f == filter)
        channel.cooldowns.splice(index, 1)
    }, coolTime);
    return filter
}

/**
 * test the chat environment against the channel cooldowns. returns the filter that catches the env, else returns false
 * @param {Channel} channel 
 * @param {ChatEnvironment} env 
 * @returns {Filter|false}
 */
function testChannelCooldowns(channel, env) {
    for (let i = 0; i < channel.cooldowns.length; i++) {
        const predicate = channel.cooldowns[i];
        let passed = predicate.test(env)
        env.parser.seek(1)
        if (passed) return predicate
    }
    return false
}


// setting default globally defined filters,
setGlobalPerma(env => {env.parser.seek(0); return !env.command.prefixes.includes(env.parser.tell()[0])}, 'wrong prefix used')
setGlobalPerma(env => env.channel.queue.length > 5, 'message queue is too long')
setGlobalPerma(env => env.channel.excludedCommands.some(v => env.command.names.includes(v)), 'command is disabled in this channel')
setGlobalPerma(env => env.user.username == process.env.USERNAME, 'message is from self')
setGlobalPerma(env => env.channel.name == '#chiaryan' && env.user.username != 'chiaryan', 'no outsiders in #chiaryan')
setGlobalPerma(env => env.channel.muted, 'channel is muted lol')
setGlobalPerma(env => env.user.username != 'chiaryan' && env.channel.tags.includes('dev'), 'dev-only command')

// filters for tagged channels
setGlobalPerma(env => env.channel.tags.includes('no-emotes') && command.tags.includes("emote"), 'emote command not allowed in this channel')
setGlobalPerma(env => env.channel.tags.includes('no-weeb') && command.tags.includes("weebhunt"), 'weebhunting not allowed in this channel')


module.exports = {
    setGlobalCooldown,
    setGlobalPerma,
    removeGlobalFilter,
    testGlobalFilters,
    setChannelCooldown,
    testChannelCooldowns,
    setFilterString
}

