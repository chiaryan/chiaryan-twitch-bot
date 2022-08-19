const {Command} = require('../lib/command')
const utils = require('../lib/utils')
const FANCIFY_MISSING = new Map([
    [0x1d455,'\u210e'],
    [0x1d49d,'\u212c'],
    [0x1d4a0,'\u2130'],
    [0x1d4a1,'\u2131'],
    [0x1d4a3,'\u210b'],
    [0x1d4a4,'\u2110'],
    [0x1d4a7,'\u2112'],
    [0x1d4a8,'\u2133'],
    [0x1d4ad,'\u211b'],
    [0x1d4ba,'\u212f'],
    [0x1d4bc,'\u210a'],
    [0x1d4c4,'\u2134'],
    [0x1d506,'\u212d'],
    [0x1d50b,'\u210c'],
    [0x1d50c,'\u2111'],
    [0x1d515,'\u211c'],
    [0x1d51d,'\u2128'],
    [0x1d53a,'\u2102'],
    [0x1d53f,'\u210d'],
    [0x1d545,'\u2115'],
    [0x1d547,'\u2119'],
    [0x1d548,'\u211a'],
    [0x1d549,'\u211d'],
    [0x1d551,'\u2124']
])
const STYLE_ALIAS = new Map([
    ['serif', 'serif'],
    ['s', 'serif'],
    ['sans-serif', 'sans-serif'],
    ['ss', 'sans-serif'],
    ['sansserif', 'sans-serif'],
    ['sansserif', 'sans-serif'],
    ['sansserif', 'sans-serif'],
    ['script', 'script'],
    ['fancy', 'script'],
    ['monospace', 'monospace'],
    ['m', 'monospace'],
    ['ms', 'monospace'],
    ['doublestruck', 'doublestruck'],
    ['ds', 'doublestruck'],
    ['d', 'doublestruck'],
    ['double-struck', 'doublestruck'],
])
new Command(['fancify', 'fc'], function ({
    parser: {tell, read, rest},
    respond, cool
}) {
    /**
     * style will take on following values corresponding to various unicode blocks
     * 0  SERIF (regular text)
     * 1  SERIF bold
     * 2  SERIF italic
     * 3  SERIF bold italic
     * 4  SCRIPT
     * 5  SCRIPT bold
     * 6  FRAKTUR
     * 7  DOUBLESTRUCK
     * 8  FRAKTUR bold
     * 9  SANS-SERIF
     * 10 SANS-SERIF bold
     * 11 SANS-SERIF italic
     * 12 SANS-SERIF bold italic
     * 13 MONOSPACE
     * 
     * unicode codepoint = 119756 + 52 * block index + index of letter
     */
    
    if (utils.weebEmotes.includes(rest())) {
        respond('no DansGame')
        cool(10000)
    } else {
        /** @type {'script'|'serif'|'script'|'fraktur'|'doublestruck'|'sans-serif'|'monospace'} */
        let style = '';
        let isBold = false;
        let isItalic = false;

        // block of code to parse options from the message string. can be broken out of when parsin is done
        parsing:
        {
            style = STYLE_ALIAS.get(tell())
            if (style) {
                read()
            } else {
                style = 'script'
                break parsing;
            }
            if (tell() == 'bold') {
                isBold = true
                read()
            } else if (tell() == 'italic') {
                isItalic = true 
                read()
            } else break parsing;

            if (!isBold && tell() == 'bold') {
                isBold = true
                read()
            } else if (!isItalic && tell() == 'italic') {
                isItalic = true
                read()
            }
        }

        let text = rest()
        let block = 0
        switch (style) {
            case 'serif':
                if (isBold && isItalic) block = 3
                else if (isBold) block = 1
                else if (isItalic) block = 2
                else block = 0
                break;
            case 'sans-serif':
                if (isBold && isItalic) block = 12
                else if (isBold) block = 10
                else if (isItalic) block = 11
                else block = 9
                break;
            case 'script':
                if (isBold) block = 5
                else block = 4
                break;
            case 'fraktur':
                if (isBold) block = 8
                else block = 6
                break;
            case 'doublestruck':
                block = 7
                break;
            case 'monospace':
                block = 13
                break;
        }

        if (!text) {
            respond('you must specify a text to turn 𝓕𝓐𝓝𝓒𝓨')
            cool(3000)
        } else if (block == 0) {
            respond(text + ' FeelsDankMan',true)
            cool(3000)
        } else {
            let offset = 119756 + 52 * block
            respond(text.replace(/[a-z]/gi, (match) => {
                let cp = match.charCodeAt(0)
                /**
                 * Unicode Stuff:
                 * we want the indexes 0 - 51 to correspond to ABCD..WXYZabcd...wxyz
                 * A is U+0041 -> code point is 65
                 * but in the Basic Latin code block the sequence is WXYZ[\]^_`abcd
                 * so we first check if the character is lowercase , ie codepoint > 65 + 26 = 91
                 * if it's uppercase, offset by 65
                 * if it's lowercase, offset by 65 + 7 = 71
                 */
                let LatinCP = cp > 91 ? cp - 71 : cp - 65;
                let newCP = LatinCP + offset
                // check to see if the character is one of the missing ones from another plane
                return FANCIFY_MISSING.get(newCP) || String.fromCodePoint(newCP)
            }), true)
            cool()
        }
    }
}, { helpText: 'fancify/fc: Turns text 𝓕𝓐𝓝𝓒𝓨. Optionally specify modifiers before text to change the style: serif( bold/italic), sans-serif( bold, italic), script( bold), monospace, double-struck', weebBanned: true})