const { Command } = require('../lib/command');
const channels = require('../lib/channel');

new Command('channels', function ({ respond, cool }) {
    let channelsSeparatedByCommas = channels.list
        // adds a zero-width character to not ping them
        .map(ch => ch.name.slice(1, 2) + '\u0000' + ch.name.slice(2))
        .join(', ');

    respond(`FeelsDankMan I am currently connected to these channels: ${channelsSeparatedByCommas}`);
    cool(40000);
});
