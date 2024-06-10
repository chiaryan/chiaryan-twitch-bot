const { Command } = require('../lib/command');

new Command(['glitch', 'gl'], function ({ parser: { rest }, cool, respond }) {
    let text = rest();
    if (text) {
        let glitchedText = '';
        for (let i = 0; i < text.length; i++) {
            if (text[i] === ' ') {
                glitchedText += '▒';
            } else {
                glitchedText += text[i];
            }
            glitchedText += '҉';
        }
        respond('▒҉' + glitchedText + '▒҉', true);
        cool();
    } else {
        respond('You have to input text to ▒҉g҉l҉i҉t҉c҉h҉▒҉ first');
        cool(3000);
    }
}, { helpText: 'glitch/gl: Glitches the following sentence ▒҉l҉i҉k҉e҉▒҉t҉h҉i҉s҉▒҉', weebBanned: true });
