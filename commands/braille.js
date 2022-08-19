const Jimp = require('jimp')
const utils = require('../lib/utils')
const {Command} = require('../lib/command')

var fonts = new Map();
Jimp.loadFont(Jimp.FONT_SANS_128_BLACK).then(fnt => {
    fonts.set('sans', fnt)
});
['comic-sans', 'condensed', 'arial-black', 'impact'].forEach(name => {
    Jimp.loadFont(`./fonts/${name}/${name}.fnt`).then(fnt => {
        fonts.set(name, fnt)
    })
});

new Command('braille', function ({
    parser: {
        tell, read, rest
    }, user, cool, respond, channel
}) {
    // bot accepts 2 
    let isInverted = false
    if (tell() == 'invert') {
        isInverted = true
        read()
    } else if (tell() == 'uninvert') {
        read()
    }
    let font = fonts.get(tell())
    if (!font) {
        font = fonts.get('sans')
    } else {
        read()
    }
    let text = rest()
    let textWidth = Jimp.measureText(font, text)
    let b = () => {
        if (textWidth > 600) {
            respond('That text is too long FeelsDankMan')
            cool(3000)
        } else {
            new Jimp(1000, 1000, '#FFFFFF', (err, image) => {
                image.print(font, 0, 0, {
                    text: text,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
                }, 1000, 1000);
                image.autocrop({ leaveBorder: 5 })
                image.contain(1296, 254)
                // image.write('nam.jpg');
                let brailleChar = 0;
                let threshold = 170
                let output = '';
                function scanForDot(x, y, w, h) {
                    brailleChar >>= 1
                    let totalPixelColour = 0;
                    image.scan(x, y, w, h, function (x1, y1, idx) {
                        totalPixelColour += this.bitmap.data[idx]
                    })
                    if (!(totalPixelColour / (w * h) > threshold) != !isInverted) {
                        brailleChar ^= 128
                    }
                    // console.log(totalPixelColour / (w * h))
                };
                [...Array(3).keys()].map(ele => ele * 100 + 1).forEach((row, rowIndex) => { //for each row
                    [...Array(32).keys()].map(ele => ele * 41 + 1).forEach(col => { //for each character
                        let arr = [col, col + 14]
                        arr.forEach((a) => {
                            [row, row + 15, row + 29].forEach((b, bIndex) => {
                                scanForDot(a, b, 9, bIndex === 1 ? 8 : 9)
                            });
                        });
                        arr.forEach((a) => {
                            scanForDot(a, row + 43, 9, 9)
                        });
                        output += String.fromCodePoint(10240 + brailleChar);
                        brailleChar = 0;
                    });
                    if (rowIndex != 2) {
                        output += ' '
                    };
                })
                let outputArr = output.split(' ')
                if (!isInverted) {
                    if (outputArr.every(val => /^⣿⣿⣿⣿⣿⣿⣿⣿⣿.{0,}⣿⣿⣿⣿⣿⣿⣿⣿⣿/.test(val))) {
                        outputArr = outputArr.map(line => '⠀⠀⠀⠀' + line.slice(4, line.length - 4))
                    }
                } else {
                    if (outputArr.every(val => /.{0,}⠀⠀⠀⠀⠀⠀⠀/.test(val))) {
                        outputArr = outputArr.map(line => line.slice(0, line.length - 4))
                    }
                }
                output = outputArr.join(' ');
                // console.log(output.match(new RegExp(`${isInverted ? '⠀' : '⣿'}+`, 'g')).map(ele => ele.length).join(' '))
                respond(user['display-name'] + ', ' + output)
                cool(7000)
            })
        }
    }
    if (!rest()) {
        respond('You need to give some text to turn into braille first')
        cool(3000)
    } else if (/[^!\"#\$%&\'\(\)\*\+,-\.\/\s0123456789:;<=>\?@QWERTYUIOPASDFGHJKLZXCVBNM\[\\\]\^_qwertyuiopasdfghjklzxcvbnm\{\|\}~÷]/.test(text)) {
        respond('The text contains a character unsupported by the command FeelsDankMan')
        cool(3000)
    } else if (utils.weebEmotes.includes(rest()) || ['anime', 'hentai', 'lolis', 'loli'].includes(text.toLowerCase())) {
        respond('no DansGame')
        cool(10000)
    } else if (['poggers', 'feelsweirdman'].includes(rest().toLowerCase())) {
        b()
    } else {
        utils.checkApi(channel, rest(), function () {
            respond('banned by api monkaS')
            cool()
        }, function () {
            b()
        })
    }
}, {
        helpText: 'Usage: ^braille [invert?] <font?> text. Takes text and turns it into braille/ASCII art, optionally inverting it. Currently supported fonts are: sans, comic-sans, arial-black, and condensed',
        weebBanned: true
})