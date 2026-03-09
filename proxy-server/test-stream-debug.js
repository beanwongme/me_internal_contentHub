/**
 * Debug test for streaming
 * Tests if the proxy properly forwards the stream
 */

const http = require('http');

console.log('Testing streaming through proxy...\n');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/chat/completions',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const requestBody = JSON.stringify({
  model: 'kimi-k2.5',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Say "Hello from Kimi" and nothing else.' }
  ],
  max_tokens: 20,
  temperature: 1,
  stream: true
});

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Content-Type: ${res.headers['content-type']}`);
  console.log('---');
  
  let chunkCount = 0;
  let fullData = '';
  
  res.on('data', (chunk) => {
    chunkCount++;
    const chunkStr = chunk.toString();
    fullData += chunkStr;
    
    console.log(`Chunk #${chunkCount} (${chunkStr.length} bytes):`);
    console.log(chunkStr);
    console.log('---');
    
    // Parse SSE data
    const lines = chunkStr.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        try {
          const data = JSON.parse(line.slice(6));
          const content = data.choices?.[0]?.delta?.content || '';
          const reasoning = data.choices?.[0]?.delta?.reasoning_content || '';
          if (content || reasoning) {
            console.log(`  -> Content: "${content || reasoning}"`);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  });
  
  res.on('end', () => {
    console.log(`\n=== Stream complete ===`);
    console.log(`Total chunks: ${chunkCount}`);
    console.log(`Total data length: ${fullData.length}`);
  });
});

req.on('error', (e) => {
  console.error(`Request failed: ${e.message}`);
});

req.write(requestBody);
req.end();
