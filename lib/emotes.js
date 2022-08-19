/**
 * utilities for working with global/channel emote data 
 */
const {httpRequest} = require('./utils')
const assert = require('assert')
module.exports = {
    twitch: [],
    ffz: [],
    bttv: [],
    /**
     * getter that returns a single array of all global emotes.
     * @returns {string[]}
     */
    get all () {
        return this.twitch.concat(this.ffz).concat(this.bttv)
    },
    /**
     * checks whether a word is a global emote
     * @param {string} word 
     * @returns {boolean}
     */
    has (word) {
        return this.twitch.includes(word) || this.bttv.includes(word) || this.ffz.includes(word)
    }
}
/** reloads all global emotes */
module.exports.reloadGlobalEmotes = function () {

    // getting global emotes from Twitch API
    const twitchRequest = httpRequest({
        hostname: 'api.twitch.tv',
        path: '/kraken/chat/emoticon_images?emotesets=0',
        headers: {
            "Accept" : "application/vnd.twitchtv.v5+json",
            'Client-ID': process.env.CLIENT_ID
        }
    }).then(response => {
        try {
            // try to get the emotes from the JSON response.
            let emotes = JSON.parse(response)['emoticon_sets']['0'].map(emote => emote.code)
            // If there's an error while parsing/getting emotes, the below code will not execute
            module.exports.twitch = emotes
            return {
                success: true,
                emotes: emotes
            }
        } catch (error) {
            return {
                success: false,
                emotes: []
            }
        }
    })

    // Getting from FFZ
    const ffzRequest = httpRequest({
        hostname: 'api.frankerfacez.com',
        path: '/v1/set/global'
    }).then(response => {
        try {
            let emotes = JSON.parse(response).sets['3'].emoticons.map(emote => emote.name)
            module.exports.twitch = emotes
            return {
                success: true,
                emotes: emotes
            }
        } catch (error) {
            return {
                success: false,
                emotes: []
            }
        }
    })
    
    // Getting from BTTV
    const bttvRequest = httpRequest({
        hostname: 'api.betterttv.net',
        path: '/3/cached/emotes/global'
    }).then(response => {
        try {
            let emotes = JSON.parse(response).map(emote => emote.code)
            module.exports.twitch = emotes
            return {
                success: true,
                emotes: emotes
            }
        } catch (error) {
            return {
                success: false,
                emotes: []
            }
        }
    })

    // return promises for the request to each entity, along with a promise that resolves when all requests are resolved
    return {
        twitch: twitchRequest,
        ffz: ffzRequest,
        bttv: bttvRequest,
        all: Promise.all([twitchRequest, ffzRequest, bttvRequest])
    }
}
/**
 * given a Channel object, reload the FFZ and BTTV emotes.
 * @param {import('../chiarbot').Channel} channel
 */
module.exports.reloadChannelEmotes = function(channel) {
    const bttvRequest = httpRequest({
        hostname: 'api.betterttv.net',
        path: '/3/cached/users/twitch/' + channel.id
    }).then(responseS => {
        try {
            let response = JSON.parse(responseS)
            let emotes = response.channelEmotes.map(emote => emote.code).concat(response.sharedEmotes.map(emote => emote.code))
            channel.emotes.bttv = emotes
            return {
                success: true,
                emotes: emotes
            }
        } catch (error) {
            return {
                success: false,
                emotes: []
            }
        }
    })

    const ffzRequest = httpRequest({
        hostname: 'api.frankerfacez.com',
        path: '/v1/room/id/' + channel.id
    }).then(responseS => {
        try {
            let response = JSON.parse(responseS)
            let emotes = response.sets[String(response.room.set)].emoticons.map(emote => emote.name)
            channel.emotes.ffz = emotes
            return {
                success: true,
                emotes: emotes
            }
        } catch (error) {
            return {
                success: false,
                emotes: []
            }
        }
    })

    return {
        bttv: bttvRequest,
        ffz: ffzRequest,
        all: Promise.all([bttvRequest,ffzRequest])
    }
}
const fallbackTree = [
    ['forsenSheffy','DatSheffy'],
    ['WAYTOODONK','WAYTOODANK'],
    ['WAYTOODANK','WutFace'],
    ['PagChomp','Pog'],
    ['Pog','PogChamp'],
    ['HONEYDETECTED','BBaper'],
    ['BBaper','bUrself'],
    ['4HEad','4Head'],
    ['Kapp','Kappa'],
    ['ABDULpls','ANELEpls'],
    ['ANELEpls','ANELE'],
    ['forsenComfy','ANELE'],
    ['monkaOMEGA','monkaS'],
    ['PepeS','monkaS'],
    ['MEGALUL','Pepega'],
    ['4House','4HEad'],
    ['pajaDank','FeelsDankMan'],
    ['FeelsDonkMan','FeelsDankMan'],
    ['miniDank','pajaDank'],
    ['Okayeg','Okayge'],
    ['Okayge','Okayga'],
    ['Okayga','FeelsOkayMan'],
    ['Pepege','Pepega'],
    ['forsenGa','Pepega'],
    ['pepeMeltdown','PepeS'],
    ['ppBounce','ppHop'],
    ['ppHopper','ppHop'],
    ['ppHop','pepeL'],
    ['ppL','pepeL'],
    ['WeirdChamping','WeirdChamp'],
    ['WeirdChamp','FeelsWeirdMan'],
    ['weirdL','FeelsWeirdMan'],
    ['pajaCMON','FeelsWeirdMan'],
    ['gachiHYPER','gachiBASS'],
    ['gachiBOP','gachiBASS'],
    ['gachiBASS','gachiGASM'],
    ['OMEGALUL','LULW'],
    ['LULWide','LULW'],
    ['LULW','LUL'],
    ['OMGScoots','forsenScoots'],
    ['forsenRope','⎝']
].map(([replaced, replacement]) => {
    return {replaced, replacement}
})
/**
 * tries to find a fallback for the given emote in the channel
 * @param {import('../chiarbot').Channel} channel 
 * @param {string} emote 
 */
module.exports.emoteFallback = function(channel, startEmote) {
    assert(!startEmote.includes(' '))
    let foundEmote = startEmote
    // console.log('\nsearching down\n')
    while (!channel.emotes.bttv.includes(foundEmote) && !channel.emotes.bttv.includes(foundEmote) && !module.exports.has(foundEmote)) {
        // try searching the fallback tree for an emote-replacement pair
        let branch = fallbackTree.find(e => e.replaced == foundEmote)
        if (branch) foundEmote = branch.replacement
        // if no pair is found, set the foundEmote to nothing
        else {
            foundEmote = ''
            break;
        }
    }
    if (foundEmote) {
        return foundEmote
    }
    foundEmote = startEmote
    // console.log('\nsearching up\n')
    // if searching down the tree fails, start searching up the tree instead
    let fdm = em => {
        if (channel.emotes.bttv.includes(em) || channel.emotes.ffz.includes(em) || module.exports.has(em)) {
            // if we find an emote that matches
            foundEmote = em
        } else {
            // get all the emotes that point to that tail
            let pointerList = fallbackTree.filter(e => e.replacement == em).map(e => e.replaced)
            // if the list isn't empty, aka we are not at the top of the branch
            if (pointerList.length != 0) {
                // call this function on each emote pointing to this emote
                pointerList.forEach(e => {em = e; fdm(e)})
            }
        }
    }
    fdm(foundEmote)
    // finally, if an emote still has not been found, just return the original emote
    if (foundEmote) return foundEmote
    else return startEmote
}