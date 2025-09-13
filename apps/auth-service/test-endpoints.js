const http = require('http');

const testEndpoint = (path, description) => {
  return new Promise(resolve => {
    const options = { hostname: 'localhost', port: 3003, path, method: 'GET' };
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        console.log(`\n📍 ${description}:`);
        console.log(`Status: ${res.statusCode}`);
        try {
          const json = JSON.parse(data);
          console.log(`Response: ${JSON.stringify(json, null, 2)}`);
        } catch (e) {
          console.log(`Response: ${data.substring(0, 200)}...`);
        }
        resolve();
      });
    });
    req.on('error', err => {
      console.log(`❌ Error testing ${description}: ${err.message}`);
      resolve();
    });
    req.end();
  });
};

async function runTests() {
  console.log('🧪 Probando endpoints del Auth Service...\n');

  await testEndpoint('/health', 'Health Check');
  await testEndpoint('/api/auth/test', 'Auth Test Endpoint');
  await testEndpoint('/api-docs', 'API Documentation');

  console.log('\n✅ Pruebas completadas!');
}

runTests();
