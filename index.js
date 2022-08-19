// load environment variables
require('dotenv').config()

// connect the bot
require('./lib/chiarbot')


// add modules for various commands
require('./commands/botcommands')
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
    // allow writing the error file to error.txt when error
    process.on('uncaughtException', (err) => {
        require('fs').writeFile('error.txt',err.stack,'utf8',(error) => {
            console.log(error)
            process.exit(1)
        })
        console.log(err)
    })
}