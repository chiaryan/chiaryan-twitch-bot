// load environment variables
require('dotenv').config()

//configure logger
require("./lib/logger");

// connect the bot
require('./lib/chiarbot')


// add modules for various commands
require('./commands/botcommands')
require('./commands/devcommands')
require('./commands/braille')
require('./commands/fancify')
require('./commands/hangman')
require('./commands/cardsagainsthumanity')

// if the command is 'node index aws',
if (process.env.ENABLE_AWS == 'TRUE') {
    // start the express server that accepts twitch webhooks
    require('./lib/botserver')
    
    // enable the commands that do weeb hunting
    require('./commands/awscommands')
}