const net = require('net');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  if (process.argv.length !== 5) {
    console.log("Usage: node filename.js <IP> <port> <time>");
    return;
  }

  const ip = process.argv[2];
  const port = parseInt(process.argv[3]);
  const time = parseInt(process.argv[4]);

  const endTime = Date.now() + time;

  while (Date.now() < endTime) {
    try {
      // Establish TCP connection
      const client = new net.Socket();
      await new Promise((resolve, reject) => {
        client.connect(port, ip, resolve);
        client.on('error', reject);
      });

      // Generate random data
      const data = Buffer.alloc(1300);
      crypto.randomFillSync(data);

      // Send data
      await new Promise((resolve, reject) => {
        client.write(data, null, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      console.log("Data sent successfully!");
      client.destroy();
    } catch (err) {
      console.log(`Failed to connect or send data: ${err}`);
    }

    await sleep(1000); // Wait for 5 seconds before sending the next packet
  }
})();
