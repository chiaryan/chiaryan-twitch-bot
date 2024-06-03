// load environment variables
require('dotenv').config()

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

var writeErrToFile = async err => {
    console.log(err);
    await require("fs/promises").writeFile('error.txt', err.stack, 'utf8');
    process.exit(1);
}

process.on('uncaughtException', writeErrToFile);
process.on("unhandledRejection", writeErrToFile);