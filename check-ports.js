/**
 * Simple port checker to identify which ports are working
 */

const http = require('http');

const ports = [3000, 3001, 3002];

async function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/`, (res) => {
      console.log(`✅ Port ${port} - Status: ${res.statusCode}`);
      resolve({ port, status: res.statusCode, working: true });
    });
    
    req.on('error', (err) => {
      console.log(`❌ Port ${port} - Error: ${err.message}`);
      resolve({ port, status: null, working: false, error: err.message });
    });
    
    req.setTimeout(5000, () => {
      console.log(`⏰ Port ${port} - Timeout`);
      req.destroy();
      resolve({ port, status: null, working: false, error: 'timeout' });
    });
  });
}

async function main() {
  console.log('🔍 Checking ports 3000, 3001, and 3002...');
  
  for (const port of ports) {
    await checkPort(port);
  }
  
  console.log('✅ Port check completed');
}

main().catch(console.error);