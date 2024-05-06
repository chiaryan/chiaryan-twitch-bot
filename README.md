# Twitch chatbot with predefined commands 

## Features

- notable commands
    - ^hangman (whispered)
        - starts an interactive hangman game in the specified channel
    - ^braille
        - converts text into a picture form using Braille patterns, example: HELLO ->
          ⣿⣿⣿⣿⠉⣿⣿⡏⢹⡏⣉⣉⣉⣹⡏⣿⣿⣿⡏⢹⣿⣿⣿⠟⢉⣉⠙⣿⣿⣿⣿⣿ 
          ⣿⣿⣿⣿⠀⣤⣤⡄⢸⡇⣉⣉⣉⣿⡇⣿⣿⣿⡇⢸⣿⣿⣿⢸⣿⣿⣿⠀⣿⣿⣿⣿ 
          ⣿⣿⣿⣿⣀⣿⣿⣇⣸⣇⣉⣉⣉⣹⣇⣉⣉⣉⣧⣈⣉⣉⣿⣦⣈⣉⣠⣿⣿⣿⣿⣿
    - ^yourmom
        - gets a random yo-mama joke from an internet database
    - ^huntweebs, ^killweebs, ^tortureweebs (**currently non-functional**)
        - Point system with values stored in a database


## Setup

### Create a bot account

Create a new Twitch account for your bot. If you want to use a preexisting account like your own, skip this step and use your own account. 

### Register a Twitch application

To allow the bot to use the Twitch API you need to [register an application](https://dev.twitch.tv/docs/authentication/register-app/) on **your** account (not the bot account!) on the Twitch dev console. This will give you the `CLIENT_ID` and `CLIENT_SECRET` to use API endpoints.

You need to create some configuration files before using the bot.
### `./.env`: Environment Variables

We use the [`dotenv`](https://www.npmjs.com/package/dotenv) package to store permanent config info. Create a `.env` config file in the root of the repository. The following fields need to be present in the file:

* `USERNAME`: the username of the twitch account of the chatbot that will connect to Twitch's servers
* `CLIENT_ID`: The ID that represents you application. Get this from registering * the application on Twitch.
* `CLIENT_SECRET`: Required for access to the Twitch API. **Treat this as if it were a password, and do not share it with others.**
* `ENABLE_AWS` (optional, currently non-functional): Flag that allows weeb-hunting database commands. Can be `TRUE`, or `FALSE` which is the default.

```
USERNAME=spergbot02
CLIENT_ID=<yourclientidhere>
CLIENT_SECRET=<yourclientsecrethere>
# optional, you don't need to include this line
ENABLE_AWS=FALSE
```

### `./channelsettings.json`: Channel parameters

The `./channelsettings.json` is a [JSON](https://www.json.org/json-en.html) file containing an array of the channels that the bot will connect to on startup. Some of the channels can also be augmented to affect the behaviour of the chatbot in those channels.

* `"name"`: the name of the channel that the bot will connect to.
* `"id"`: the public, unique ID of that user. There are [tools](https://www.streamweasels.com/tools/convert-twitch-username-to-user-id/#) available to translate a name to a channel ID.
* `"settings"`
    * `"banphraseApiURL"`: The URL of a `pajbot`-style API.
    * `"excludedCommands"`: an array of commands to disable
    * `"coolTime"`: The default time for the chat bot to cool down between commands. In milliseconds.
    * `"queueTime"`: the time interval for the bot to send queued messages. In milliseconds.
    * `"messageLength"`: The minimum length that a message can have (before being broken up)
    * `"muteWhenOnline"`: If `true`, the bot will mute when the channel is live.
    * `"tags"`: and array of strings, used to categorise channels
    tags can contain
        * `"no-emotes"` - Users can't use the "^*emotes" commands in this channel
        * `"no-weeb"` - Users can't use weeb hunting commands in this channel
    * `"connected"`: If `false`, don't connect to this channel on startup
```json
[
  {
    "name": "chiaryan",
    "id": "180782930",
    "settings": {
        "coolTime": 200,
        "queueTime": 200,
    }
  },
  {
    "name": "forsen",
    "id": "22484632",
    "settings": {
      "banphraseApiURL": "https://forsen.tv/api/v1/banphrases/test",
      "excludedCommands": ["bttvemotes", "ffzemotes", "globalemotes"],
      "messageLength": 200,
      "muteWhenOnline": true
    }
  }
]
```
### Authorization Grant

You need the bot account to authorize the dev (your) account to send messages on its behalf.

running `node index.js` without a valid authorization will generate a link for you to click through to your browser. Make sure to authorize on your **bot** account.

```bash
$ node index.js
...
Refresh token invalid. Please create a new one through this link https://id.twitch.tv/oauth2/authorize?client_id=leClientIdfkn1rai00zxovxyccdyyo5m&redirect_uri=http%3A%2F%2Flocalhost%3A3000&response_type=code&scope=chat%3Aread%20chat%3Aedit
```

After authorizing the client, copy the authorization code from the url that twitch redirects you to, under the `code` field. You can pass this code through the command line when while starting the application.
### Starting the bot
To run the bot for the first time after getting the authorization code, do `node index.js --oauth <the auth code>` from authorizing the application. The bot should start and connect to Twitch.

However, if the bot is already storing the authorization tokens required, you can just do `node index.js`.