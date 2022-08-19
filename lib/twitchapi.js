const { httpRequest } = require('./utils')
const { PartiQLUpdate } = require('./awsutils')
const qs = require('querystring')

const HELIX_API_HOSTNAME = "api.twitch.tv"
const TWITCH_AUTHENTICATION_HOSTNAME = "id.twitch.tv"
const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET

var twitchAccessToken

// if using AWS features, get the access token from the database, if not get it from process.env 
if (process.env.ENABLE_AWS == 'TRUE') {
     PartiQLUpdate('SELECT "Value" FROM "GlobalData" WHERE "Name" = \'TwitchAccessToken\'').then( output => {
        twitchAccessToken = output.Items[0].Value.S
    })
} else {
    twitchAccessToken = process.env.APP_ACCESS_TOKEN
}

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
])

/**
 * In the event that a twitch access token is expired, refresh the token using out client secret
 * @returns {Promise<string>}
 */
async function refreshAccessToken() {
    const query = qs.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials'
    })
    const { access_token: token } = await httpRequest({
        hostname: TWITCH_AUTHENTICATION_HOSTNAME,
        path: `/oauth2/token?${query}`,
        method: 'POST'
    }, true)
    return token
}
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
 * } TwitchAPIEndpoints
 */

/**
 * make a query to the Twitch API using a named endpoint
 * @param {TwitchAPIEndpoints} endpoint - the name of the endpoint 
 * @param {object} options - a querystring stringify-able object of options to pass to the endpoint
 */
module.exports.twitchApiRequest = async function (endpoint, options = {}) {
    const query = qs.stringify(options)
    let response = await httpRequest({
        hostname: HELIX_API_HOSTNAME,
        path: `${endpointMap.get(endpoint)}?${query}`,
        headers: {
            'Client-ID': CLIENT_ID,
            'Authorization': 'Bearer ' + process.env.APP_ACCESS_TOKEN
        }
    }, true)
    // refresh the access token if it is found to be expired
    if (response.error == 'Unauthorized' && response.status == 401) {
        twitchAccessToken = await refreshAccessToken()
        console.log('new twitch access token: ' + twitchAccessToken);
        // update the database with the new access token
        if (process.env.ENABLE_AWS == 'TRUE') {
            PartiQLUpdate(`UPDATE "GlobalData" SET "Value" ='${twitchAccessToken}' where "Name" = 'TwitchAccessToken'`)
        }
        // retry the request
        response = await httpRequest({
            hostname: HELIX_API_HOSTNAME,
            path: `${endpointMap.get(endpoint)}?${query}`,
            headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': 'Bearer ' + twitchAccessToken            }
        }, true)
    }
    return response
}


