const utils = require('../lib/utils')
const {Command, WhisperedCommand} = require('../lib/command')
const {create, get: getChannel} = require('../lib/channel')
const {emoteFallback} = require('../lib/emotes')
const {info : log} = require("winston");

create.prototype.hangman = {
    /** @type {NodeJS.Timeout} */
    timeout: undefined,
    isRunning: false,
    phrase: undefined,
    guess: undefined,
    lettersLeft: new Set,
    lettersGuessed: [],
    triesLeft: undefined,
    reset() {
        this.isRunning = false
        this.phrase = undefined
        this.guess = undefined
        this.lettersLeft.clear()
        this.lettersGuessed = []
        this.triesLeft = undefined
    },
    insert(l) {
        let i = 0;
        while (i < this.lettersGuessed.length && l > this.lettersGuessed[i]) {
            i++
        }
        this.lettersGuessed = this.lettersGuessed.slice(0,i).concat(l,this.lettersGuessed.slice(i))
    }
}
new Command('hangman', function (bot) { bot.respond(`${bot.user['display-name']} whisper the bot "^hangman ${bot.channel.name.slice(1)} 𝘱𝘩𝘳𝘢𝘴𝘦 to start a hangman in this channel FeelsDankMan`); bot.cool(10000) }, { helpText: `whisper the bot "^hangman channel 𝘱𝘩𝘳𝘢𝘴𝘦 to start a hangman in this channel FeelsDankMan` })
new WhisperedCommand('hangman', function(bot, channelName) {
    let channel = getChannel(channelName)
    if (channel) {
        // verify that the command is hangman and the channel exists
        let phrase = bot.parser.rest()
        if (phrase && !phrase.includes('_') && phrase.length <= 80) {
            // hangmans will not follow through if the phrase has underscores
            let hangman = channel.hangman
            if (!hangman.isRunning) {
                // fuck weebs
                if (!utils.weebEmotes.map(w => w.toLowerCase()).includes(phrase.toLowerCase())) {
                    hangman.isRunning = true
                    hangman.guess = phrase.replace(/[a-z]/gi, (match) => {
                        // search through the phrase for letters. If found, add it to the pool of letters left and replace the letter with a '_'
                        hangman.lettersLeft.add(match.toLowerCase())
                        return '_'
                    })
                    if (hangman.lettersLeft.size == 0) {
                        // if there weren't any valid letters to begin with, cancel the minigame
                        hangman.reset()
                    } else {
                        utils.checkApi(channel, phrase, function () { hangman.reset() }, function () {
                            log(`${bot.user.username} has started a hangman in ${channel.name} with phrase ${phrase}`);
                            hangman.phrase = phrase
                            hangman.triesLeft = 6
                            // set a timeout to stop the hangman and send a timeout message and store the id so we can clear it later
                            hangman.timeout = setTimeout(() => {
                                bot.chat(`hangman timed out FeelsDankMan the answer was: ${hangman.phrase} FeelsDankMan whisper the bot "^hangman ${channel.name.slice(1)} 𝘱𝘩𝘳𝘢𝘴𝘦" to start a new game`, channel)
                                hangman.reset()
                                log('hangman timed out')
                            }, 30000)
                            bot.chat(`${bot.user['display-name']} has started a hangman ${emoteFallback(channel, 'PagChomp')} ${hangman.guess} FeelsDankMan Do ^guess <letter> to guess a letter. You have ${hangman.triesLeft} guesses.`, channel)
                        })
                    }
                } else {
                    bot.chat(`${bot.user['display-name']} tried to start a hangman with a weeb emote and deserves to be publicly shamed DansGame`, channel)
                }
            } else {
                log(`${bot.user.username} tried started a hangman in ${channel.name} with phrase ${phrase}, but hangman is still running`)
            }
        }
    }
})

new Command('guess', function (bot) {
    let hangman = bot.channel.hangman
    if (hangman.isRunning && bot.parser.rest()) { // if there's a hangman even going on and the user actually tries to guess something
        if (bot.parser.rest().toLowerCase() == hangman.phrase.toLowerCase()) {
            // if the phrase is guessed
            clearTimeout(hangman.timeout)
            bot.respond(`chat von ZULUL the phrase was: ${hangman.phrase} FeelsDankMan whisper the bot "^hangman ${bot.channel.name.slice(1)} 𝘱𝘩𝘳𝘢𝘴𝘦" to start another game`)
            hangman.reset()
        } else {
            letter = bot.parser.read().toLowerCase()
            if (/[a-z]/i.test(letter) && letter.length == 1 && !hangman.lettersGuessed.includes(letter)) {
                // if the letter is a letter and not guessed before, the bot will reply something, and hence we can clear the timeout and set a new one
                clearTimeout(hangman.timeout)
                hangman.timeout = setTimeout(() => {
                    bot.respond(`hangman timed out FeelsDankMan the phrase was: ${hangman.phrase} FeelsDankMan whisper the bot "^hangman ${bot.channel.name.slice(1)} 𝘱𝘩𝘳𝘢𝘴𝘦" to start a new game`)
                    hangman.reset()
                    // log('hangman timed out')
                }, 60000)
    
                if (hangman.lettersLeft.has(letter)) { // if the letter is guessed correctly
                    hangman.lettersLeft.delete(letter)
    
                    // replace the underscores in hangman.guess
                    hangman.guess = hangman.guess.replace(/./g, function (match, offset) {
                        if (hangman.phrase[offset].toLowerCase() == letter) {
                            return hangman.phrase[offset]
                        } else {
                            return match
                        }
                    })
    
                    // insert it alphabetically to prevent cmonBruh
                    hangman.insert(letter)
                    if (hangman.lettersLeft.size <= 0) {
                        bot.respond(`chat von ZULUL the phrase was: ${hangman.guess} FeelsDankMan whisper the bot "^hangman ${bot.channel.name.slice(1)} 𝘱𝘩𝘳𝘢𝘴𝘦" to start another game`)
                        clearTimeout(hangman.timeout)
                        hangman.reset()
                    } else {
                        bot.respond(`${bot.user['display-name']} guessed the right letter PagChomp ${hangman.guess} miniDank You've guessed: ${hangman.lettersGuessed.join(' ')}`)
                        bot.cool()
                    }
                } else {
                    hangman.triesLeft--
                    hangman.insert(letter)
                    if (hangman.triesLeft <= 0) {
                        bot.respond(`chat lost ZULUL the answer was: ${hangman.phrase} FeelsDankMan whisper the bot "^hangman ${bot.channel.name.slice(1)} 𝘱𝘩𝘳𝘢𝘴𝘦" to start another game`)
                        clearTimeout(hangman.timeout)
                        hangman.reset()
                    } else {
                        bot.respond(`${bot.user['display-name']} guessed the wrong letter ${hangman.triesLeft == 1 ? 'monkaS' : 'LULW'} ${hangman.triesLeft} tr${hangman.triesLeft == 1 ? 'y' : 'ies'} left.`)
                        bot.cool()
                    }
                }
            }
        } 
    }
}, {helpText: 'guesses a letter. If you think you know the answer, guess the whole phrase instead! PagChomp'})