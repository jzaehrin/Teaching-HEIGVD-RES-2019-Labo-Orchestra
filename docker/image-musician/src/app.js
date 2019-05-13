const dgram = require('dgram');
const cron = require('node-cron');

if (process.argv[2] === undefined) {
  console.error('Usage : app.js <instrument>');
  process.exit(1);
}

const sender = dgram.createSocket('udp4');

const instruments = new Map([
  ['piano', 'ti-ta-ti'],
  ['trumpet', 'pouet'],
  ['flute', 'trulu'],
  ['violin', 'gzi-gzi'],
  ['drum', 'boum-boum'],
]);

const sound = instruments.get(process.argv[2]);

cron.schedule('* * * * * *', () => {
  sender.send(sound, 0, sound.length, 23456, '239.255.22.5');
});
