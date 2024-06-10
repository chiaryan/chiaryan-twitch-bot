const { Command } = require('../lib/command');
const utils = require('../lib/utils');

new Command('specimen', function ({ respond, cool, f }) {
    let spec1 = utils.pickOne('S', 'SH');
    let spec2 = utils.pickOne('E', 'EE', 'I');
    let spec3 = utils.pickOne('C', 'SH');
    let spec4 = utils.pickOne('I', 'E', 'U');
    let specimen = `${spec1}P${spec2}${spec3}IM${spec4}N`;
    respond((specimen === 'SPECIMEN' ? 'forsenGOW' : f('forsenGa')) + ' ' + specimen);
    cool(2500);
}, { helpText: 'Generates a random specimen forsenGa' });
