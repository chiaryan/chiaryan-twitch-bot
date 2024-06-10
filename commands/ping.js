const { Command } = require('../lib/command');
new Command("ping", async function ({ f, ...bot }) {
  pingCommandTemplate(`OH ZOINKS YOU JUST GOT FLIPPIN\' PONGED NaM `, bot);
})
new Command("bing", async function ({ f, ...bot }) {
  pingCommandTemplate(`BONG ${f('WAYTOODANK')} `, bot);
})
new Command("ping", async function ({ f, ...bot }) {
  pingCommandTemplate("DONG gachiGASM ", bot);
})
new Command("ding", async function ({ f, ...bot }) {
  pingCommandTemplate(`TONG ${f('pajaDank')} 🔔`, bot);
})

async function pingCommandTemplate(prefix, bot) {
  bot.respond(`${prefix} ${await bot.client.ping() * 1000} ms`);
  bot.cool(3000);
}
