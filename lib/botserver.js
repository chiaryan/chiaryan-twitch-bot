const axios = require('axios')
const express = require('express')
const bodyParser = require('body-parser')
const channels = require('./channel')
const { exec } = require('child_process')
const {twitchApiRequest} = require('./twitchapi')
var instanceDns;

var app = express()

// twitch will send me a GET request containing a challenge token, which i have to respond with
app.get(/^\/\d+/,(req,res) => {
    console.log(req.query)
    console.log('get\n')
    res.status(200).send(req.query["hub.challenge"])
})

// when the channel goes live/offline, twitch will send me a POST request
app.post(/^\/\d+/, bodyParser.json(), (req, res) => {
    // this receives notifications from twitch
    console.log(req.body)
    // using the path that the post request was sent to, identify the channel that has went online/offline
    let channel = channels.get(Number(req.path.slice(1)),'id')
    if (!req.body.data[0]) {
        // if the channel goes offline
        channel.muted = false
        console.log(`channel ${channel.name} went offline`);
    } else {
        if (req.body.data[0].type == "live") {
            // if the channel goes live
            channel.muted = true
            console.log(`channel ${channel.name} went live`)
        }
    }
    console.log('post\n')
    res.sendStatus(200)
})
app.listen(8080,() => {
    console.log('listening on 8080')
})
function subToTopic(id) {
    axios({
        method: "post",
        headers: {
            "Client-ID": process.env.CLIENT_ID,
            Authorization: 'Bearer ' + process.env.APP_ACCESS_TOKEN
        },
        url: "https://api.twitch.tv/helix/webhooks/hub",
        params: { 
            'hub.callback': 'http://' + instanceDns + ':8080/' + String(id),
            'hub.lease_seconds': 86400,
            'hub.mode': 'subscribe',
            'hub.topic': 'https://api.twitch.tv/helix/streams?user_id=' + String(id)
        }
    }).then(response => {
        console.log(`subscription to ${String(id)} success`)
    }).catch(error => {
        console.log(error.response.data)
    })
} 

// retrieve the DNS for the aws instance
exec('aws ec2 describe-instances --query "Reservations[*].Instances[*].[PublicDnsName]"',(err,stdout,stderr) => {
    instanceDns = JSON.parse(stdout)[0][0][0]
    // for each channel that i want to mute when online, 
    channels.list.forEach(channel => {
        if (channel.muteWhenOnline) {
            // interval to make a webhook sub to twitch api every 24h
            setInterval(() => {
                subToTopic(channel.id)
            },86400000)
            // kick off the sub
            subToTopic(channel.id)
            // get info about the channel to see if it is live. if it is, mute the bot 
            axios.get('https://api.twitch.tv/helix/streams',{
                headers: {
                    "Client-ID": process.env.CLIENT_ID,
                    Authorization: 'Bearer ' + process.env.APP_ACCESS_TOKEN
                },
                params: {
                    'user_id': String(channel.id)
                }
            }).then(response => {
                if (response.data.data[0]) {
                    channel.muted = true
                }
            })
        }
    })
})

/** poll that checks api every 5 seconds for live channels */

let monitoredChannels = channels.list.filter(ch => ch.muteWhenOnline)

setInterval(async () => {
    let {data: liveChannels} = twitchApiRequest('get-streams', {user_id: monitoredChannels.map(ch => ch.id)})
    monitoredChannels.forEach(ch => {
        if (liveChannels.find(chData => ch.id == chData.user_id)) {
            ch.muted = true
        } else {
            ch.muted = false
        }
    })
}, 5000);