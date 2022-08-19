// commands that deal with weeb hunting. Makes use of DynamoDB and hence will only work on an EC2 instance.
const {Command} = require('../lib/command')
const utils = require('../lib/utils')
const assert = require('assert')
const {emoteFallback} = require('../lib/emotes')
const {queryGlobalData, queryUserData, queryUserDataByUsername, updateUsername, updateGlobalData, updateUserData, dbClient} = require('../lib/awsutils')
const {QueryCommand, ScanCommand, UpdateItemCommand} = require('@aws-sdk/client-dynamodb')

/** @typedef {import('@aws-sdk/client-dynamodb').QueryCommandInput} QueryCommandInput  */
/** @typedef {import('@aws-sdk/client-dynamodb').UpdateItemCommandInput} UpdateItemCommandInput  */

const weebMessages = {
    kill: {
        all: [
            (name, toGas, channel) => `${name} dropped a nuclear bomb on ${toGas} weebs! Not a single one survived... ${emoteFallback(channel,'forsenSheffy')}`,
            (name, toGas, channel) => `${name} dunked their weeb cage in a pit of boiling oil, frying all of their ${toGas} weebs into a crisp. ${emoteFallback(channel,'forsenSheffy')}`,
            (name, toGas, channel) => `${name} put ${toGas} weebs in front of a firing squad, leaving none left standing. ${emoteFallback(channel,'forsenSheffy')}`,
            (name, toGas) => `${name} | 👮 You told all ${toGas} weebs that the waifu of their dreams is waiting for them at the end of the dungeon. None of them make it through, of course. | No experience gained! FeelsBadMan`,
            (name, toGas, channel) => `${name} dropped a grand piano on their weeb cage, smushing all ${toGas} of them into a fine paste. ${emoteFallback(channel,'Okayga')} ${emoteFallback(channel,'PianoTime')}`,
            (name, toGas) => `In a sudden epidemic, ${name}'s entire population of ${toGas} weebs mysteriously died after contracting Ligma... monkaS`,
            (name, toGas, channel) => `${name} tossed their weeb cage into the crater of a volcano! All ${toGas} weebs popped due to the water in their bodies instantly converting to steam. ${emoteFallback(channel,'forsenScoots')}`,
            (name, toGas) => `${name} played Twisting Nether, destroying all ${toGas} weebs on the board. 🌌🌀🌌`,
            (name, toGas, channel) => `${name} played Plague of Death, silencing and destroying all ${toGas} weebs on the board. ${emoteFallback(channel,'pepeL')} 🏜`,
            (name, toGas) => `${name} launched all ${toGas} weebs into the fucking sun, and has no weebs left! 🌞 Clap`
        ],
        one: [
            (name, left, channel) => `${name} pushed a weeb off a cliff and has ${left} weeb${left == 1 ? '' : 's'} left! ${emoteFallback(channel,'forsenSheffy')}`,
            (name, left, channel) => `${name} buried a weeb in cement and has ${left} weeb${left == 1 ? '' : 's'} left! ${emoteFallback(channel,'forsenSheffy')}`,
            (name, left, channel) => `${name} beheaded a weeb as an example to the ${left == 1 ? '' : left} other one${left == 1 ? '' : 's'}. ${emoteFallback(channel,'forsenSheffy')}`,
            (name, left) => `${name.toUpperCase()} PogChamp RAPED PogChamp AND PogChamp KILLED PogChamp A PogChamp WEEB PogChamp IN PogChamp 1990 PogChamp AND PogChamp HAS PogChamp ${left} PogChamp LEFT PogChamp`,
            (name, left, channel) => `${name} burned a weeb at the stake, forcing the ${left == 1 ? 'last one' : `${left} other ones`} to watch. ${emoteFallback(channel,'forsenSheffy')}`
        ],
        some: [
            (name, toGas, left, channel) => `${name} put ${toGas} weebs in the gas chamber and has ${left} weeb${left == 1 ? '' : 's'} left! ${emoteFallback(channel,'forsenSheffy')}`,
            (name, toGas, left, channel) => `${name} slit the throats of ${toGas} weebs and has ${left} weeb${left == 1 ? '' : 's'} left! ${emoteFallback(channel,'forsenSheffy')}`,
            (name, toGas, left, channel) => `${name} fed ${left} weeb${left == 1 ? '' : 's'} ground beef made from ${toGas} ground weeb${toGas == 1 ? '' : 's'}. ${emoteFallback(channel,'4HEad')}`,
            (name, toGas, left, channel) => `${name} sacrificed ${toGas} weebs to the BOG. ${left} weeb${left == 1 ? '' : 's'} remain${left == 1 ? 's' : ''}... ${emoteFallback(channel,'MEGALUL')}`,
            (name, toGas, left, channel) => `${name} showed ${toGas} weebs what a real man has! gachiGASM They just couldn't handle the manliness... ${emoteFallback(channel,'gachiBASS')} Clap ${name} has ${left} weeb${left == 1 ? '' : 's'} left!`,
            (name, toGas, left, channel) => `${name} told ${toGas} weebs that anime girls will never be real, and they decided to off themselves. FeelsGoodMan There ${left == 1 ? 'is' : 'are'} now ${left} weeb${left == 1 ? '' : 's'} left.`,
            (name, toGas, left, channel) => `${name} popped a cap in ${toGas} weebs and has ${left} weeb${left == 1 ? '' : 's'} left in da hood! ${emoteFallback(channel,'TriKool')}`,
            (name, toGas, left, channel) => `${name} put ${toGas} weebs in the oven and has ${left} weeb${left == 1 ? '' : 's'} left! ${emoteFallback(channel,'forsenSheffy')}`,
            (name, toGas, left, channel) => `OH SNAP! ✨👌 ${emoteFallback(channel,'4HEad')} ${name} erased ${toGas} weebs from existence and has ${left} weeb${left == 1 ? '' : 's'} left!`,
            (name, toGas, left, channel) => `${name} drove a truck into ${toGas} weebs and has ${left} weeb${left == 1 ? '' : 's'} left! ${emoteFallback(channel,'ABDULpls')}`,
            (name, toGas, left, channel) => `${name} made ${toGas} weeb pancakes with a steamroller and has ${left} weeb${left == 1 ? '' : 's'} left! 🚜 ${emoteFallback(channel,'KKonaW')}`,
            (name, toGas, left, channel) => `${name} sent ${toGas} weebs to be killed by Joe and has ${left} weeb${left == 1 ? '' : 's'} left. Wait... who's Joe? monkaS`,
            (name, toGas, left, channel) => `${name} hung ${toGas} weebs in the gallows and has ${left} weeb${left == 1 ? '' : 's'} left! FeelsGoodMan 👉 ${emoteFallback(channel,'forsenRope')} PunOko`,
            (name, toGas, left, channel) => `Using ancient Ugandan magic, ${name} turned ${toGas} weebs into POO POO! PowerUpL ZULUL ${name} has ${left} weeb${left == 1 ? '' : 's'} left!`,
            (name, toGas, left, channel) => `With proper certification from the local authorities, ${name} humanely put down ${toGas} weebs via lethal injection, and has ${left} weeb${left == 1 ? '' : 's'} remaining in captivity. FeelsOkayMan 🍷`
        ]
    },
    torture: [
            (name,tortured,dead, channel) => `${name} subjected ${tortured == 1 ? 'a' : tortured} weeb${tortured == 1 ? '' : 's'} to COCK AND BALL TORTURE ${emoteFallback(channel,'gachiHYPER')} ${tortured == 1 ? 'it' : `${dead} of them`} died from cock and ball loss.`,
            (name,tortured,dead) => `${name} put ${tortured == 1 ? 'a' : tortured} weeb${tortured == 1 ? '' : 's'} on the stretching rack. ${tortured == 1 ? 'It' : `${dead} of them`} turned into weeb spaghetti. 🍝 NaM 👌`,
            (name,tortured,dead) => `${name} forced ${tortured == 1 ? 'a' : tortured} weeb${tortured == 1 ? '' : 's'} to watch regular porn. ${dead == 1 ? 'it' : `${dead} of them`} killed ${dead == 1 ? 'itself' : 'themselves'}. FeelsGoodMan`,
            (name,tortured,dead, channel) => `${name} released ${tortured == 1 ? 'a' : tortured} weeb${tortured == 1 ? '' : 's'} into a room full of BEES! ${emoteFallback(channel,'BBaper')} ${tortured == 1 ? 'it was' : `${dead} of them ${dead == 1 ? 'was' : 'were'}`} stung to death. ${emoteFallback(channel,'HONEYDETECTED')}`,
            (name,tortured,dead) => `${name} took ${tortured == 1 ? 'a' : tortured} weeb${tortured == 1 ? '' : 's'} on a field trip to a Chinese reeducation camp MingLee ${tortured == 1 ? 'It' : `${dead} of them`} had ${dead == 1 ? 'its' : 'their'} organs harvested.`,
            (name,tortured,dead, channel) => `${name} left ${tortured == 1 ? 'a' : tortured} weeb${tortured == 1 ? '' : 's'} at the mercy of ${emoteFallback(channel,'gachiPRIDE')} THE ${emoteFallback(channel,'gachiPRIDE')} TIME ${emoteFallback(channel,'gachiPRIDE')} WIZARD ${emoteFallback(channel,'gachiPRIDE')} ${tortured == 1 ? 'It' : `${dead} of them`} died of old age.`,
            (name,tortured,dead) => `${name} set fire to waifu pillows in front of ${tortured == 1 ? 'a' : tortured} weeb${tortured == 1 ? '' : 's'}. ${tortured == 1 ? 'It' : `${dead} of them`} just couldn't take it and ended ${dead == 1 ? 'its life' : 'their lives'}. FeelsGoodMan`,
            (name,tortured,dead) => `${name} forced ${tortured == 1 ? 'a' : tortured} weeb${tortured == 1 ? '' : 's'} to watch XQC 😂 ${tortured == 1 ? 'it' : `${dead} of them`} coudn't handle the juice and cringed to death. LUL`
    ],
    multiply: [
            (name, toGas, total, channel) => `${name} put ${toGas == 1 ? 'the' : toGas} weeb${toGas == 1 ? '' : 's'} in the wrong chamber! monkaS ${toGas == 1 ? 'It' : 'They'} underwent mitosis and now there are ${total} weebs in the cage! ${emoteFallback(channel,'WAYTOODANK')}`,
            (name, toGas, total, channel) => `${name} put ${toGas == 1 ? 'the' : toGas} weeb${toGas == 1 ? '' : 's'} in the wrong chamber! monkaS ${toGas == 1 ? 'It' : 'They'} started ${toGas == 1 ? 'multiplying' : 'breeding'} and now there are ${total} weebs in the cage! ${emoteFallback(channel,'WAYTOODANK')}`,
            (name, toGas, total, channel) => `${name} put ${toGas == 1 ? 'the' : toGas} weeb${toGas == 1 ? '' : 's'} in the wrong chamber! monkaS ${toGas == 1 ? 'It' : 'They'} pulled in ${toGas == 1 ? 'a weeb from another dimension': 'more weebs from other dimensions'} and now there are ${total} in the cage! ${emoteFallback(channel,'WAYTOODANK')}`,
            (name, toGas, total, channel) => `${name} put ${toGas == 1 ? 'the' : toGas} weeb${toGas == 1 ? '' : 's'} in the wrong chamber! monkaS ${toGas == 1 ? 'It' : 'They'} opened a portal to Japan and now there are ${total} weebs in the cage! ${emoteFallback(channel,'WAYTOODANK')}`
    ]
}

new Command(['cagedweebs','cw'], async function(bot, name) {
    /** @type {QueryCommandInput} */
    let params = {
        TableName: 'UserData'
    }
    // if a user's name is requested, use the secondary index to query the Username
    if (name) {
        params.IndexName = 'Username-index'
        params.KeyConditionExpression = 'Username = :u'
        params.ExpressionAttributeValues = {':u': {S: name.toLowerCase()}}
    // otherwise, use the user's Twitch ID to query the database
    } else {
        params.KeyConditionExpression = 'TwitchID = :id'
        params.ExpressionAttributeValues = {':id': {N: bot.user['user-id']}}
    }
    try {
        let output = await dbClient.send(new QueryCommand(params))
        if (output.Count == 0) bot.respond(`${bot.user['display-name']}, data not found FeelsDankMan . ${name ? 'That user':'You'} may not have any caged weebs.${name ? '':` Do ^huntweebs to get some for your cage. ${bot.f('forsenSheffy')}`}`)
        else {
            let cagedWeebs = output.Items[0].CagedWeebs.N
            if (name) bot.respond(`${bot.user['display-name']}, that user has ${cagedWeebs} caged weeb${cagedWeebs == 1 ? '':'s'}.`)
            else bot.respond(`${bot.user['display-name']}, you have ${cagedWeebs} caged weeb${cagedWeebs == 1 ? '':'s'}. Do ^killweebs <number> to slaughter ${cagedWeebs == 1 ? 'it':'them'}! ${bot.f('forsenSheffy')} Clap`)
        }
    } catch (error) {
        bot.respond('error retrieving data FeelsDankMan')
    }
    bot.cool()
},{helpText: 'cagedweebs/cw: Gets the number of weebs in your, or a specified user\'s, cage', tags: ['weebhunt']})

/** @type {{id: string, time: number}[]} */
var weebHuntTimers = []
const weebTimeout = 20 * 60 * 1000 // time between each weeb hunt
new Command(['huntweebs','hw'], async function (bot) {
    let user = weebHuntTimers.find(e => e.id == bot.user['user-id'])
    if (user) {
        // if their user is still in the list, aka still on cooldown, tell them how long they have left
        let timeLeft = weebTimeout - Date.now() + user.time
        let sec = Math.ceil(timeLeft/1000)
        let h = Math.floor(sec/3600)
        let m = Math.floor((sec % 3600)/60)
        let s = Math.floor((sec % 60))
        bot.respond(`${bot.user['display-name']}, there don't seem to be any weebs around... come back in ${h < 10 ? '0': ''}${h}:${m < 10 ? '0': ''}${m}:${s < 10 ? '0': ''}${s} if you want to search for more weebs. ${bot.f('forsenSheffy')}`)
        bot.cool(timeLeft < 60000 ? timeLeft : 60000)
    } else {
        // if the user is not on the list and ready to hunt weebs, put their user object in the list and set a timeout to remove it
        weebHuntTimers.push({id: bot.user['user-id'], time: Date.now()})
        setTimeout(() => {
            weebHuntTimers = weebHuntTimers.filter(e => e.id != bot.user['user-id'])
        }, weebTimeout)
        // randomly roll a number of weebs that were caught to add it to the user's database, from 50-150
        const weebsCaught = Math.floor(50 + Math.random() * 100)
        // these update options updates a user's caged weebs and username
        /** @type {UpdateItemCommandInput} */
        let updateParams = {
            TableName: 'UserData',
            Key: {TwitchID: {N: bot.user['user-id']}},
            UpdateExpression: `SET Username :u ADD CagedWeebs :wc, KilledWeebs :0`,
            ExpressionAttributeValues: {
                ':u':  { S: bot.user.username },
                ':wc': { N: String(weebsCaught)},
                ':0':  { N: '0'}
            },
            ReturnValues: "ALL_NEW"
        }
        try {
            const {Attributes: {CagedWeebs: { N: cagedWeebs}}} = await dbClient.send(new UpdateItemCommand(updateParams))
            bot.respond(`${bot.user['display-name']} hunted ${weebsCaught} weebs and now has ${cagedWeebs} weebs in the cage! ${weebsCaught == 69 ? 'gachiGASM': bot.f('forsenSheffy')} Do ^killweebs <number> to slaughter them!`)
        } catch (error) {
            bot.respond('error updating database FeelsDankMan .')
            console.log(error);
            bot.cool()
        }
    }
},{helpText: `huntweebs/hw: Captures a number of weebs for your cage. You can only hunt in ${weebTimeout/60000} min intervals`, tags:["weebhunt"]})

new Command(['killweebs','kw','gasweebs','gw'], async function({cool, user, respond, f, parser: {rest, read}, channel},weebsToGas) {
    if (weebsToGas) {
        try {
            const { Count, Items } = await queryUserData(user['user-id'])
            if (Count == 0) {
                respond(`${user['display-name']}, you don't have any caged weebs. Do ^huntweebs to get some for your cage. ${f('forsenSheffy')}`)
                cool()
            } else {
                assert(Count == 1)
                const cagedWeebs = Number(Items[0].CagedWeebs.N)
                // if the number is 'all', set to all the weebs in the user's cage
                if (weebsToGas == 'all') {
                    weebsToGas = cagedWeebs
                } else {
                    weebsToGas = Number(weebsToGas)
                }
                // checking the number to make sure it is appropriate
                let failText = ''
                if (isNaN(weebsToGas)) {
                    failText = `${user['display-name']}, That is not a valid number. Specify a number of weebs to put into the chamber. ${f('forsenSheffy')}`
                } else if (weebsToGas < 0) {
                    failText = `Sorry ${user['display-name']}, You can't bring weebs back to life. The last time that happened, it was a complete disaster! DansGame`
                } else if (!Number.isInteger(weebsToGas)) {
                    failText = `${user['display-name']}, As good as it sounds, you can't sacrifice pieces of weeb at a time. Please use a whole number of weebs. ${f('forsenSheffy')}`
                } else if (cagedWeebs == 0) {
                    failText = `${user['display-name']}, you don't have caged weebs. Do ^huntweebs to get some for your cage. ${f('forsenSheffy')}`
                } else if (weebsToGas == 0) {
                    failText = `${user['display-name']}, you'll have to sacrifice SOME weebs. Please specify a number greater than 0. ${f('forsenSheffy')}`
                } else if (weebsToGas > cagedWeebs) {
                    failText = `${user['display-name']}, that number is too large. You only have ${cagedWeebs} caged weebs! :(`
                }
                if (failText) {
                    respond(failText)
                    cool()
                } else {
                    // if the number is (finally) valid, create the params needed for database updating
                    let actions = []
                    let killWeebText = ''
                    if (Math.random() < 0.3 && !(/^\w+$/i.test(read()) && weebsToGas == 1)) { 
                        // 30% chance of weebs multiplying, unless the user wants to kill a weeb by specifying a username after a 1
                        // update the caged weebs only, adding the weebs to be gassed
                        killWeebText = utils.pickOne(weebMessages.multiply)(user['display-name'],weebsToGas, cagedWeebs + weebsToGas, channel)
                        actions.push('WeebHunt.CagedWeebs = WeebHunt.CagedWeebs +' + String(weebsToGas))
                        respond(killWeebText)
                        cool()
                    } else {
                        // otherwise, kill the weebs as planned, subtracting them from caged and adding them to killed
                        actions.push('WeebHunt.CagedWeebs = WeebHunt.CagedWeebs - ' + String(weebsToGas),'WeebHunt.KilledWeebs = WeebHunt.KilledWeebs + ' + String(weebsToGas))
                        // then, respond with a successful gassing
                        let killWeebText
                        if (weebsToGas == 1) {
                            if (cagedWeebs == 1) {
                                killWeebText = `${user['display-name']} gassed their only weeb. ${f('forsenSheffy')}`
                            } else {
                                killWeebText = utils.pickOne(weebMessages.kill.one)(user['display-name'], cagedWeebs - weebsToGas, channel)
                            }
                        } else {
                            if (weebsToGas == cagedWeebs) {
                                killWeebText = utils.pickOne(weebMessages.kill.all)(user['display-name'], cagedWeebs, channel)
                            } else {
                                killWeebText = utils.pickOne(weebMessages.kill.some)(user['display-name'],weebsToGas, cagedWeebs - weebsToGas, channel)
                            }
                        }
                        respond(killWeebText)
                        cool()
                        //finally, update the global weebs killed
                        updateGlobalData(['KilledWeebs = KilledWeebs + ' + String(weebsToGas)])
                    }
                    // update the weebhunt data for that user
                    updateUserData(user['user-id'], actions, user.username)
                }
            
            }
        } catch (error) {
            respond('error updating data FeelsDankMan')
            cool()
        }
    } else {
        respond(`${user['display-name']}, You need to provide a number of weebs to put into the chamber. ${f('forsenSheffy')}`)
        cool(3000)
    }
},{helpText: 'killweebs/kw/gasweebs/gw: Provide a number of weebs, or all, to put into the chamber DatSheffy Clap This may or may not go wrong monkaS', tags:["weebhunt"]})

new Command(['deadweebs','dw','killedweebs','kw'], async function({user, respond, cool, f}, name) {
    if (name) {
        var userQuery = queryUserDataByUsername(name.toLowerCase())
    } else {
        var userQuery = queryUserData(user['user-id'])
    }
    const [userData, globalData] = await Promise.all([userQuery, queryGlobalData()])
    if (userData.Count == 0) {
        respond(`${user['display-name']}, data not found FeelsDankMan . ${name ? 'That user':'You'} may not have killed any weebs.`)
        cool(7000)
    } else {
        assert(userData.Count == 1)
        const userKilledWeebs = userData.Items[0].KilledWeebs.N
        const globalKilledWeebs = globalData.Items[0].KilledWeebs.N
        if (userKilledWeebs == '0') {
            respond(`${user['display-name']}, ${name ? 'That user has':'You have'} not killed any weebs. A total of ${globalKilledWeebs} weebs have been killed globally. ${f('forsenSheffy')} Clap`)
        } else {
            respond(`${user['display-name']}, ${name ? 'That user has':'You have'} killed ${userKilledWeebs == 1 ? 'only one weeb' :`a total of ${userKilledWeebs} weebs`}. A total of ${globalKilledWeebs} weebs have been killed globally. ${f('forsenSheffy')} Clap`)
        }
        cool(7000)
    }
},{helpText: 'deadweebs/dw/killedweebs/kw: Gets the number of weebs that you, or a specified user, have killed in total', tags:["weebhunt"]})

new Command(['freeweebs','releaseweebs'],async function({user, respond, cool, f}) {
    try {
        const output = await queryUserData(user['user-id'])
        if (output.Count == 0) {
            respond(`${user['display-name']}, you don't have any weebs to free FeelsBadMan . Do ^huntweebs to get some for your cage. (data not found)`)
            cool()
        } else {
            const cagedWeebs = data.Items[0].CagedWeebs.N
            if (cagedWeebs == '0') {
                // no caged weebs
                respond(`${user['display-name']}, you don't have any weebs to free FeelsBadMan . Do ^huntweebs to get some for your cage.`)
                cool()
            } else {
                let killText = ''
                if (user.username == 'chiaryan') {
                    killText = `${user['display-name']} freed all ${cagedWeebs} weebs back into the wild. FeelsGoodMan ✨`
                } else {
                    switch (Math.ceil(Math.random() * 2)) {
                        case 1:
                            killText = `${user['display-name']} freed ${cagedWeebs == 1 ? 'their last weeb... from its': `all of their ${cagedWeebs} weebs... from their`} miserable existence. ${f('forsenSheffy')} `
                        case 2:
                            killText = `${user['display-name']} gave all ${cagedWeebs} weebs the freedom of having a .22 caliber bullet lodged in their skulls.🔫 ${f('forsenSheffy')}`
                    }
                }
                respond(killText)
                cool(10000)
                updateUserData(user['user-id'], ['WeebHunt.CagedWeebs = 0', 'WeebHunt.KilledWeebs = WeebHunt.KilledWeebs + ' + String(cagedWeebs)], user.username)
                updateGlobalData(['KilledWeebs = KilledWeebs + ' + String(cagedWeebs)])
            }
        }
    } catch (error) {
        respond('error retrieving data FeelsDankMan')
        console.log(error);
    }
},{helpText: 'freeweebs: Frees all your caged weebs FeelsGoodMan ✨', tags:["weebhunt"]})

/**
 * Command whereby the user specifies a number of weebs from their cage to put to torture. 
 * a random number of the tortured weebs are killed.
 */
new Command(['tortureweebs','tw'], async function({cool, user, respond, f, channel}, weebsToTorture) {
    if (weebsToTorture) {
        const output = await queryUserData(user['user-id'])
        if (output.Count == 0) { // if the user is in the database retrieve their caged weebs
            respond(`${user['display-name']}, you don't have any caged weebs. Do ^huntweebs to get some for your cage. ${f('forsenSheffy')} (data not found)`)
            cool()
        } else {
            const cagedWeebs = Number(output.Items[0].CagedWeebs.N)
            // if the number is 'all', set to all the weebs in the user's cage
            if (weebsToTorture == 'all') {
                weebsToTorture = cagedWeebs
            } else {
                weebsToTorture = Number(weebsToTorture)
            }
            // checking the number to make sure it is appropriate
            if (isNaN(weebsToTorture)) {
                var failText = `${user['display-name']}, That is not a valid number. Specify a number of weebs to torture. ${f('forsenSheffy')}`
            } else if (weebsToTorture < 0) {
                var failText = `Sorry ${user['display-name']}, you can't untorture weebs! The mental scars remain forever... ${f('forsenSheffy')}`
            } else if (!Number.isInteger(weebsToTorture)) {
                var failText = `${user['display-name']}, you can't torture pieces of weeb, because those pieces will be dead weebs. ${f('forsenSheffy')}`
            } else if (cagedWeebs == 0) {
                var failText = `${user['display-name']}, you don't have caged weebs. Do ^huntweebs to get some for your cage. ${f('forsenSheffy')}`
            } else if (weebsToTorture == 0) {
                var failText = `${user['display-name']}, torturing no weebs would be a waste of the torture chamber! Please specify a number greater than 0. ${f('forsenSheffy')}`
            } else if (weebsToTorture > cagedWeebs) {
                var failText = `${user['display-name']}, that number is too large. You only have ${cagedWeebs} caged weebs! :(`
            }
            if (failText) {
                respond(failText)
                cool()
            } else {
                // roll a random number of weebs that died, from 1 to all
                let weebsKilled = Math.ceil(Math.random() * weebsToTorture)
                // then, get a random torture message and respond with it
                let text = utils.pickOne(weebMessages.torture)(user['display-name'],weebsToTorture,weebsKilled, channel)
                respond(text)
                cool()
                // update the weebhunt data for that user
                updateUserData(user['user-id'], ['WeebHunt.CagedWeebs = WeebHunt.CagedWeebs - ' + String(weebsKilled), ' WeebHunt.KilledWeebs = WeebHunt.KilledWeebs + ' + String(weebsKilled)], user.username)
                updateGlobalData(['KilledWeebs = KilledWeebs + ' + String(weebsKilled)])
            }
        }
    } else {
        respond(`${user['display-name']}, You need to provide a number of weebs to torture. ${f('forsenSheffy')}`)
        cool(3000)
    }
},{helpText: 'tortureweebs/tw: Tortures a specified number of your caged weebs. Some weebs may die. forsenSheffy Clap', tags:['weebhunt']})

/**
 * checks the ranking of killed weebs the command user, or a specified user, holds among all othe users
 */
new Command('weebrank', async function({cool, user, respond, f}, name) {
    let queryOutput = name ? await queryUserDataByUsername(name.toLowerCase()) : await queryUserData(user['user-id'])
    if (queryOutput.Count == 0) respond(`${user['display-name']}, data not found FeelsDankMan . ${name ? 'That user':'You'} may not have killed any weebs.`)
    else {
        const killedWeebs = queryOutput.Items[0].KilledWeebs.N
        if (killedWeebs == '0') respond(`${user['display-name']}, ${name ? `that user hasn't killed any weebs. Yet. ${f('forsenSheffy')}`:`you haven't killed any weebs yet. What are you, some kind of weeb? ${f('LULW')}`}`)
        else {
            // scan the user database, filtering only the users who have greater or equal number of killed weebs. the number of users returned is the position of the user 
            let command = new ScanCommand({
                TableName: 'Users',
                ProjectionExpression: 'Username, WeebHunt.KilledWeebs',
                ExpressionAttributeValues: {
                    ':n': {N: killedWeebs}
                },
                FilterExpression: 'WeebHunt.KilledWeebs >= :n',
            })
            const {Count: userCount} = await dbClient.send(command)
            if (name) {
                respond(`${user['display-name']}, that user has killed ${killedWeebs} weebs and ranks #${userCount} on the leaderboards! ${f('forsenSheffy')}`)
            } else {
                respond(`${user['display-name']}, you have killed ${killedWeebs} weebs and you rank #${userCount} on the leaderboards! ${f('forsenSheffy')}`)
            }
        }
    } 
    cool(30000)
},{helpText: 'weebrank: Shows your, or a specified user\'s ranking on the leaderboard of weeb slayers',tags:['weebhunt']})

/**
 * displays the top 10 weebkilling users 
 */
new Command('weebslayers', await function({cool, channel, respond, f}) {
    
    let command = new ScanCommand({
        TableName: 'UserData',
        ProjectionExpression: 'Username, KilledWeebs',
        ExpressionAttributeValues: {
            ':n': {N :'200000'}
        },
        FilterExpression: 'KilledWeebs > :n',
    })
    const { Items } = await dbClient.send(command)
    let rankingText = Items
        .sort((a,b) => Number(b.KilledWeebs.N) - Number(a.KilledWeebs.N))
        .slice(0,channel.name == '#forsen' ? 3 : 10)
        .map((item, index) => `#${index + 1}: ${item.Username.S} (${item.KilledWeebs.N})`)
        .join(', ')
    respond(`The top weeb slayers are: ${rankingText}. Good job hunters! ${f('forsenSheffy')} Clap`, true, 490)
    cool(60000)
}, {helpText: 'weebslayers: Gets the users with the most killed weebs on the leaderboards forsenSheffy Clap',tags:['weebhunt']})
