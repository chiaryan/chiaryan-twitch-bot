const fs = require('fs/promises')
const utils = require('./utils')
const qs = require('querystring');
const assert = require('assert');
const {info : log} = require("winston");

var REFRESH_TOKEN = "";

/**@type {Promise<void} */
var RETRIEVE_TOKENS;

module.exports = function(OAUTH_CODE) {
  if (arguments.length == 0) {
    module.exports.RETRIEVE_TOKENS = readTokens().then(validateAccessToken);
  } else if (arguments.length == 1) {
    module.exports.RETRIEVE_TOKENS = getTokensFromAuthCode(OAUTH_CODE);
  } else {
    throw "Incorrect number of arguments";
  }
}

/**
 * Checks whether the access token is valid, And refreshes it if it is not.
 * @returns {Promise<void>} Resolves when the token is validated. When this is resolved, it is guaranteed that the access token is valid.
 */
async function validateAccessToken() {
  const REQUEST = {
    hostname: "id.twitch.tv",
    path: "/oauth2/validate",
    headers: {
      "Authorization": `OAuth ${module.exports.IRC_PASSWORD}`
    }
  };
  const RESULT = await utils.httpRequest(REQUEST, true);
  const { "status": STATUS } = RESULT;

  if (STATUS == 401) {
    return await refreshAccessToken();
  }
  assert(!STATUS);
  return;
}
/**
 * Refreshes the token using client secret
 * @returns {Promise<void>} which reolves
 */
async function refreshAccessToken() {
  const QUERY_STRING = qs.stringify({
    "client_id": process.env.CLIENT_ID,
    "client_secret": process.env.CLIENT_SECRET,
    "grant_type": "refresh_token",
    "refresh_token": REFRESH_TOKEN
  })
  const REQUEST = {
    hostname: "id.twitch.tv",
    path: `/oauth2/token?${QUERY_STRING}`,
    method: 'POST'
  };
  const RESPONSE = await utils.httpRequest(REQUEST, true);
 
  if (!RESPONSE["access_token"]) {
    const { message, status } = RESPONSE;
    assert(status == 400 && message == "Invalid refresh token")
    const url = qs.stringify({
      "client_id": process.env.CLIENT_ID,
      "redirect_uri": "http://localhost:3000",
      "response_type": "code",
      "scope": "chat:read chat:edit",
    });
    throw `Refresh token invalid. Please create a new one through this link https://id.twitch.tv/oauth2/authorize?${url}`
  }

  const { "access_token": TOKEN } = RESPONSE;

  log(`Got access token ${TOKEN}`);
  module.exports.IRC_PASSWORD = TOKEN;
  writeTokens();
}

/**
 * Reads the user access token and refresh token from storage.
 * @returns {Promise<void>} that resolves when the update is successful.
 */
async function readTokens() {
  const { irc_token, refresh_token } = JSON.parse(await fs.readFile("./data/token.json"));
  if (irc_token == undefined || refresh_token == undefined) {
    throw new Error("bad ./data/token.json format");
  }
  module.exports.IRC_PASSWORD = irc_token;
  REFRESH_TOKEN = refresh_token;
  return;
}

/**
 * Writes the user access token and refresh token to ./data/token.json
 * @returns {Promise<void>} When the write to file is successful.
 */
async function writeTokens() {
  assert (typeof(module.exports.IRC_PASSWORD) == "string" && typeof(REFRESH_TOKEN) == "string")
  return await fs.writeFile("./data/token.json", JSON.stringify({
    "irc_token": module.exports.IRC_PASSWORD,
    "refresh_token": REFRESH_TOKEN
  }))
}

/**
 * From the Auth code that the user got when authorizing the bot, updates the refresh token and a new user access token.
 * 
 * Updates internally in memory and in storage.
 * @param {string} OAUTH_CODE The Auth code.
 * @returns {Promise<void>} that resolves when the update is successful, and rejects with instructions to get an auth code with an incorrect refresh token.
 */
async function getTokensFromAuthCode(OAUTH_CODE) {
  const { status, data, message } = await require("axios")({
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

  log(`Got access token from auth code: ${module.exports.IRC_PASSWORD}`)
  log(`Got refresh token from auth code: ${REFRESH_TOKEN}`)
  writeTokens();
}

module.exports.refreshAccessToken = refreshAccessToken;
module.exports.validateAccessToken = validateAccessToken;