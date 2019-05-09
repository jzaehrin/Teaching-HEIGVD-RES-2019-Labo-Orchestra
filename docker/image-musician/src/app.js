const dgram = require('dgram');
const RFC4122 = require('rfc4122');
const cron = require('node-cron');

const rfc4122 = new RFC4122();

if (process.argv[2] === undefined) {
	console.error("Usage : app.js <instrument>");
	process.exit(1);
}

let sender = dgram.createSocket('udp4');

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

cron.schedule('* * * * * *', function() {
	console.log(`Sending ${instruments.get('piano')}`);
	sender.send(instruments.get('piano'), 0, instruments.get('piano').length, 23456, '10.192.107.255');
});

