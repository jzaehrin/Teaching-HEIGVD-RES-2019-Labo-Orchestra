const RFC4122 = require('rfc4122');
const dgram = require('dgram');
const rfc4122 = new RFC4122();


class Listener {
	constructor() {
		this.baseId = rfc4122.v4f();
		this.addrToUUID = new Map();
		this.activeEntity = new Map();
	}

	onMessage(msg, rinfo) {
		if (this.onMessage.intruments === undefined) {
			this.onMessage.instruments = new Map([
				['ti-ta-ti', 'piano'],
				['pouet', 'trumpet'],
				['trulu', 'flute'],
				['gzi-gzi', 'violin'],
				['boum-boum', 'drum'],
			]);
		}
		let uuid;

		if (this.addrToUUID.has(rinfo.address)) {
			uuid = this.addrToUUID.get(rinfo.address);
		} else {
			uuid = rfc4122.v5(rfc4122.v4f(), 'string');

			this.addrToUUID.set(rinfo.address, uuid);
		}

		if (!this.activeEntity.has(uuid)) {
			this.activeEntity.set(uuid, { instrument: this.onMessage.instruments.get(msg), utc: 0 });
		}

		this.activeEntity.get(uuid).utc = new Date().getTime() / 1000;
	}
}

const server = dgram.createSocket('udp4');
const auditor = new Listener();

server.on('error', (err) => {
	console.log(`server error:\n${err.stack}`);
	server.close();
});

//server.on('message', auditor.onMessage);
server.on('message', (msg, rinfo) => {
	auditor.onMessage(msg, rinfo);
});

server.on('listening', () => {
	const address = server.address();
	console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(23456);
