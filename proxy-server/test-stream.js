/**
 * Test streaming response format
 */

require('dotenv').config();
const fetch = require('node-fetch');

const KIMI_API_KEY = process.env.KIMI_API_KEY;
const KIMI_APP_ID = process.env.KIMI_APP_ID;

async function testStreaming() {
  console.log('Testing streaming response format...\n');
  
  const requestBody = {
    model: 'kimi-k2.5',
    messages: [
      { 
        role: 'system', 
        content: `Expert LinkedIn content creator. Professional tone. English.

RULES:
- Be concise. Max 300 words.
- No thinking process. Direct output only.

OUTPUT FORMAT:
TITLE: [title]
CONTENT: [body]
HASHTAGS: [tags]`
      },
      { 
        role: 'user', 
        content: `Brief: AI Ethics in Healthcare
Goal: Educate professionals
Audience: Healthcare admins
Messages: AI safety, Compliance
Keywords: AI, healthcare

Requirements:
- Platform: LinkedIn
- Tone: Professional
- Max chars: 3000
- Include hashtags` 
      }
    ],
    max_tokens: 600,
    temperature: 1,
    stream: true
  };
  
  console.log('Sending request to Kimi API...');
  
  const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KIMI_API_KEY}`,
      'X-App-ID': KIMI_APP_ID,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  
  console.log(`Response status: ${response.status}`);
  console.log(`Content-Type: ${response.headers.get('content-type')}`);
  console.log('');
  
  if (!response.ok) {
    const error = await response.text();
    console.error('Error:', error);
    return;
  }
  
  console.log('Reading stream chunks...\n');
  
  const reader = response.body;
  let chunkCount = 0;
  let fullContent = '';
  
  reader.on('data', (chunk) => {
    chunkCount++;
    const chunkStr = chunk.toString();
    
    console.log(`=== Chunk #${chunkCount} (${chunkStr.length} bytes) ===`);
    console.log(chunkStr);
    console.log('');
    
    // Parse SSE format
    const lines = chunkStr.split('\n');
    for (const line of lines) {
      if (line.startsWith('data: ') && line !== 'data: [DONE]') {
        try {
          const data = JSON.parse(line.slice(6));
          const content = data.choices?.[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
          }
        } catch (e) {
          console.log('Parse error:', e.message);
        }
      }
    }
    
    // Stop after 5 chunks to see format
    if (chunkCount >= 5) {
      console.log('=== Stopping after 5 chunks ===\n');
      reader.destroy();
    }
  });
  
  reader.on('end', () => {
    console.log('=== Stream ended ===');
    console.log(`Total chunks: ${chunkCount}`);
    console.log(`Full content preview: "${fullContent.substring(0, 200)}..."`);
  });
  
  reader.on('error', (err) => {
    console.error('Stream error:', err);
  });
}

testStreaming().catch(console.error);
