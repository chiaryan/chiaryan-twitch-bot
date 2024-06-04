const axios = require('axios')
const https = require('https')
const {info : log} = require("winston");

function checkApi(channel, message, ifBanned = function () { }, ifNotBanned = function () { }) {
    if (channel.banphraseApiURL) {
        axios.post(channel.banphraseApiURL, { "message": message }).then(response => {
            log(response.data)
            if (response.data.banned) {
                ifBanned()
            } else {
                ifNotBanned()
            }
        });
    } else {
        ifNotBanned()
    }
}
/**
 * make a https request to a server. returns a promise that resolves with a string containing the data
 * @param {import('https')} options 
 * @param {boolean} [parseToJSON] - if true, parse the response data to JSON format before returning it
 * @returns {Promise<string>|Promise<object>}
 */
function httpRequest(options, parseToJSON = false) {
    return new Promise((resolve,reject) => {
        let req = https.request(options, res => {
            let str = ''
            res.on('data', (chunk) => {str += chunk})
            res.on('end', () => {
                resolve(parseToJSON ? JSON.parse(str) : str)
            })
            res.on('error', err => {reject(err)})
        })
        req.on('error', () => {reject(new Error('Http Request failed.'))})
        req.end()
    })
}

function pickOne(choices) {
    if (arguments.length == 1 && Array.isArray(arguments[0])) {
        return choices[Math.floor(Math.random() * choices.length)]
    } else {
        return arguments[Math.floor(Math.random() * arguments.length)]
    }
}

const weebEmotes = ['AYAYA', 'VoHiYo', 'nyanPls', 'forsenLewd', 'forsenPuke', 'forsenPuke2', 'forsenPuke3', 'forsenPuke4', 'forsenPuke5', 'TPFufun', 'TehePelo', 'KonCha', 'PinkMercy', 'RoWOW', 'PunOko', 'weebemotetest', 'RainbowPls', 'POI', 'lickR', 'lickL', 'hoSway', 'kumaPls', 'momoLewd', 'HyperNeko', 'WanWan', 'Tuturu', 'MikuStare', 'EHEHE', 'OhISee', 'nepSmug', 'TooLewd', 'KannaNom'];
var botUsers = ['pajbot']
var weebUsers = ['lumiose', 'keyzrl', 'chaskitty7', 'maplewd_ayaya_maplewd', 'spaceandenterkappa', 'minkafighter']
// let emoteFallbacks = [
//     ['forsenSheffy','DatSheffy'],
//     ['WAYTOODONK','WAYTOODANK'],
//     ['WAYTOODANK','WutFace'],
//     ['PagChomp','Pog'],
//     ['Pog','PogChamp'],
//     ['HONEYDETECTED','BBaper'],
//     ['BBaper','bUrself'],
//     ['4HEad','4Head'],
//     ['Kapp','Kappa'],
//     ['ABDULpls','ANELEpls'],
//     ['ANELEpls','ANELE'],
//     ['forsenComfy','ANELE'],
//     ['monkaOMEGA','monkaS'],
//     ['PepeS','monkaS'],
//     ['MEGALUL','Pepega'],
//     ['4House','4HEad'],
//     ['pajaDank','FeelsDankMan'],
//     ['FeelsDonkMan','FeelsDankMan'],
//     ['miniDank','pajaDank'],
//     ['Okayeg','Okayge'],
//     ['Okayge','Okayga'],
//     ['Okayga','FeelsOkayMan'],
//     ['Pepege','Pepega'],
//     ['forsenGa','Pepega'],
//     ['pepeMeltdown','PepeS'],
//     ['ppBounce','ppHop'],
//     ['ppHopper','ppHop'],
//     ['ppHop','pepeL'],
//     ['ppL','pepeL'],
//     ['WeirdChamping','WeirdChamp'],
//     ['WeirdChamp','FeelsWeirdMan'],
//     ['weirdL','FeelsWeirdMan'],
//     ['pajaCMON','FeelsWeirdMan'],
//     ['gachiHYPER','gachiBASS'],
//     ['gachiBOP','gachiBASS'],
//     ['gachiBASS','gachiGASM'],
//     ['OMEGALUL','LULW'],
//     ['LULWide','LULW'],
//     ['LULW','LUL'],
//     ['OMGScoots','forsenScoots'],
//     ['forsenRope','⎝']
// ]

// emoteFallbacks = emoteFallbacks.map(e => {
//     return {head: e[0], tail: e[1]}
// })

module.exports = {checkApi, pickOne, weebEmotes, botUsers, weebUsers, httpRequest}