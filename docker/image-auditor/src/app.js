const dgram = require('dgram');
const net = require('net');
const uuidGenerator = require('uuid/v4');

class Listener {
  constructor() {
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
      uuid = uuidGenerator();

      this.addrToUUID.set(rinfo.address, uuid);
    }

    if (!this.activeEntity.has(uuid)) {
      this.activeEntity.set(uuid, {
        instrument: this.onMessage.instruments.get(msg.toString()),
        startAt: new Date().getTime() / 1000,
        lastAt: 0,
      });
    }

    this.activeEntity.get(uuid).lastAt = new Date().getTime() / 1000;
  }

  getActiveEntity() {
    const result = [];

    this.activeEntity.forEach((entity, uuid) => {
      if (entity.lastAt + 5 >= (new Date().getTime() / 1000)) {
        result.push({
          uuid,
          instrument: entity.instrument,
          activeSince: new Date(entity.startAt * 1000).toISOString(),
        });
      }
    });

    console.log(result);

    return result;
  }
}

const serverUDP = dgram.createSocket('udp4');
const auditor = new Listener();

serverUDP.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

// server.on('message', auditor.onMessage);
serverUDP.on('message', (msg, rinfo) => {
  auditor.onMessage(msg, rinfo);
});

serverUDP.on('listening', () => {
  const address = serverUDP.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

serverUDP.bind(23456, '172.17.255.255', () => {
  serverUDP.setBroadcast(true);
});

const serverTCP = net.createServer((socket) => {
  socket.on('error', (err) => {
    console.log(`Connection ${socket.remoteAddress}:${socket.remotePort} error: ${err.message}`);
  });

  socket.write(JSON.stringify(auditor.getActiveEntity()));
  socket.end();
});

serverTCP.listen(2205, '0.0.0.0');
