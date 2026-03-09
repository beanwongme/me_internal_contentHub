/**
 * Quick test script for Kimi API connection
 * Run with: node test-kimi.js
 */

require('dotenv').config();
const fetch = require('node-fetch');

const KIMI_API_URL = 'https://api.moonshot.cn/v1';
const KIMI_API_KEY = process.env.KIMI_API_KEY;
const KIMI_APP_ID = process.env.KIMI_APP_ID;

async function testKimiConnection() {
  console.log('========================================');
  console.log('🧪 Kimi API Connection Test');
  console.log('========================================\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`   KIMI_API_KEY: ${KIMI_API_KEY ? '✅ Set (' + KIMI_API_KEY.substring(0, 20) + '...)' : '❌ Not set'}`);
  console.log(`   KIMI_APP_ID: ${KIMI_APP_ID ? '✅ Set (' + KIMI_APP_ID + ')' : '❌ Not set'}`);
  console.log();

  if (!KIMI_API_KEY) {
    console.error('❌ KIMI_API_KEY is not set!');
    console.error('   Add it to proxy-server/.env file');
    process.exit(1);
  }

  // Test 1: List models
  console.log('🔍 Test 1: Listing available models...');
  try {
    const modelsResponse = await fetch(`${KIMI_API_URL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KIMI_API_KEY}`,
        'X-App-ID': KIMI_APP_ID,
        'Content-Type': 'application/json'
      }
    });

    if (modelsResponse.ok) {
      const models = await modelsResponse.json();
      console.log(`   ✅ Success! Found ${models.data?.length || 0} models`);
      console.log(`   📝 Available models: ${models.data?.map(m => m.id).join(', ')}`);
    } else {
      console.log(`   ❌ Failed: HTTP ${modelsResponse.status}`);
      const error = await modelsResponse.text();
      console.log(`   ❌ Error: ${error}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log();

  // Test 2: Simple chat completion
  console.log('🔍 Test 2: Simple chat completion...');
  try {
    const chatResponse = await fetch(`${KIMI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIMI_API_KEY}`,
        'X-App-ID': KIMI_APP_ID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'kimi-k2.5',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say "Kimi API is working!" and nothing else.' }
        ],
        max_tokens: 20,
        temperature: 1
      })
    });

    if (chatResponse.ok) {
      const data = await chatResponse.json();
      console.log(`   ✅ Success!`);
      console.log(`   🤖 Model: ${data.model}`);
      console.log(`   💬 Response: "${data.choices?.[0]?.message?.content?.trim()}"`);
      console.log(`   📊 Tokens: ${data.usage?.total_tokens || 'N/A'} total`);
    } else if (chatResponse.status === 401) {
      console.log(`   ❌ Authentication Failed (401)`);
      console.log(`   💡 Your API key is invalid or expired`);
      console.log(`   🔧 Solutions:`);
      console.log(`      1. Check the API key in proxy-server/.env`);
      console.log(`      2. Generate a new key at https://platform.moonshot.cn/`);
      console.log(`      3. Make sure the key is active and not revoked`);
      
      const errorText = await chatResponse.text();
      console.log(`   📄 Error details: ${errorText}`);
    } else {
      console.log(`   ❌ Failed: HTTP ${chatResponse.status}`);
      const errorText = await chatResponse.text();
      console.log(`   📄 Error: ${errorText}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
  console.log();

  // Test 3: Test with wrong key (to verify error handling)
  console.log('🔍 Test 3: Testing with invalid key (error handling check)...');
  try {
    const wrongKeyResponse = await fetch(`${KIMI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer invalid-key',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'kimi-k2.5',
        messages: [{ role: 'user', content: 'Hi' }],
        max_tokens: 5
      })
    });

    if (wrongKeyResponse.status === 401) {
      console.log(`   ✅ Correctly rejected invalid key (401)`);
    } else {
      console.log(`   ⚠️  Unexpected response: HTTP ${wrongKeyResponse.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  console.log('\n========================================');
  console.log('✨ Test complete!');
  console.log('========================================');
}

testKimiConnection().catch(console.error);
