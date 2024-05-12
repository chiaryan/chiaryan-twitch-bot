const { httpRequest } = require('./utils')
const auth = require("./auth");
const qs = require('querystring');
const assert = require('assert');

const API_TWITCH_TV = "api.twitch.tv"

const endpointMap = new Map([
    ['get-channel-info', '/helix/channels'],
    ['get-top-games', '/helix/games/top'],
    ['get-games', '/helix/games'],
    ['search-categories', '/helix/search/categories'],
    ['search-channels', '/helix/search/channels'],
    ['get-streams', '/helix/streams'],
    ['get-all-stream-tags', '/helix/tags/streams'],
    ['get-all-stream-tags', '/helix/streams/tags'],
    ['get-users', '/helix/users'],
    ['get-user-follows', '/helix/users/follows'],
    ['get-videos', '/helix/videos'],
    ['get-global-emotes', "/helix/chat/emotes/global"],
])
/**
 * @typedef {
 *  'get-channel-info'
 * |'get-top-games'
 * |'get-games'
 * |'search-categories'
 * |'search-channels'
 * |'get-streams'
 * |'get-all-stream-tags'
 * |'get-all-stream-tags'
 * |'get-users'
 * |'get-user-follows'
 * |'get-videos'
 * |"get-global-emotes"
 * } TwitchAPIEndpoints
 */

async function tryTwitchApiRequest(endpoint, options = {}) {
    const QUERY = qs.stringify(options)
    const REQUEST = {
        hostname: API_TWITCH_TV,
        path: `${endpointMap.get(endpoint)}?${QUERY}`,
        headers: {
            'Client-ID': process.env.CLIENT_ID,
            'Authorization': 'Bearer ' + auth.IRC_PASSWORD
        }
    };
    return await httpRequest(REQUEST, true);
}

/**
 * make a query to the Twitch API using a named endpoint
 * @param {TwitchAPIEndpoints} endpoint - the name of the endpoint 
 * @param {object} options - a querystring stringify-able object of options to pass to the endpoint
 */
async function twitchApiRequest(endpoint, options = {}) {
    assert(process.env.CLIENT_ID != undefined)
    assert(auth.IRC_PASSWORD != undefined)
    assert(auth.RETRIEVE_TOKENS != undefined)
    const RESPONSE_1 = await tryTwitchApiRequest(endpoint, options);
    // refresh the access token if it is found to be expired
    if (RESPONSE_1.error == 'Unauthorized' && RESPONSE_1.status == 401) {
        await auth.refreshAccessToken();
        // retry the request
        const RESPONSE_2 = await tryTwitchApiRequest(endpoint, options);
        return RESPONSE_2;
    }
    return RESPONSE_1;
}

/**
 * 
 * @param {TwitchAPIEndpoints} endpoint - the name of the endpoint 
 * @returns {Promise<string[]>} A promise that resolves an array of the emote names 
 */
async function getGlobalEmotes() {
    const RESPONSE = await twitchApiRequest("get-global-emotes");
    return RESPONSE["data"].map(emote => emote["name"])
}

/**
 * 
 * @param {string[]} channels the
 * @returns {Promise<boolean[]>}
 */
async function areChannelsLive(channels) {
    const REQUEST = {
        "user_id": channels,
    }
    const RESPONSE = await twitchApiRequest("get-streams", REQUEST);
    
    const {"data": DATA } = RESPONSE;
    const LIVE_CHANNEL_IDS = new Set(DATA.map(stream => stream["user_id"]));

    return channels.map(chId => LIVE_CHANNEL_IDS.has(chId));
}
module.exports = {
    twitchApiRequest,
    getGlobalEmotes,
    areChannelsLive
}


