const dgram = require('dgram');
const cron = require('node-cron');

if (process.argv[2] === undefined) {
	console.error('Usage : app.js <instrument>');
	process.exit(1);
}

const sender = dgram.createSocket('udp4');

sender.bind(() => {
	sender.setBroadcast(true);
});

const instruments = new Map([
	['piano', 'ti-ta-ti'],
	['trumpet', 'pouet'],
	['flute', 'trulu'],
	['violin', 'gzi-gzi'],
	['drum', 'boum-boum'],
]);

cron.schedule('* * * * * *', () => {
	sender.send(instruments.get(process.argv[2]), 0, instruments.get(process.argv[2]).length, 23456, '172.17.255.255');
});
