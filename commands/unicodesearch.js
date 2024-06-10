const { Command } = require('../lib/command');
const axios = require('axios');

new Command(['unicodesearch', 'us'], function ({ parser: { rest }, ...bot }) {
    let query = rest();
    if (!query) {
        bot.respond('You need to specify search term(s) first');
        bot.cool(3000);
        return;
    }
    
    axios.get(`https://www.fileformat.info/info/unicode/char/search.htm?q=${query}&preview=entity`).then(response => {
        let searchResults = '';
        let page = response.data;
        let page2 = page.slice(page.search('<table class="table table-list table-striped">'));
        let tableString = page2.slice(0, page2.search('</table>'));
        for (let charIndex = 0; charIndex < tableString.length; charIndex++) {
            if (tableString.slice(charIndex, charIndex + 2) === 'U+') {
                let charCode = '';
                for (let searchIndex = charIndex + 2; tableString[searchIndex] != '<'; searchIndex++) { 
                    charCode += tableString[searchIndex];
                }
                searchResults += ' ' + String.fromCodePoint(parseInt(charCode, 16));
            }
        }

        if (searchResults.length === 0) {
            bot.respond('no matches found monkaS');
            bot.cool();
            return;
        }

        if (searchResults.length >= 140) {
            searchResults = searchResults.slice(0, 140);
        }

        bot.respond('matches found! ' + searchResults, true);
        bot.cool();
    });

}, { helpText: 'unicodesearch/us: Takes the following search term and searches a database for matching unicode symbols', weebBanned: true });
