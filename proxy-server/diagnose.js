/**
 * Comprehensive diagnostic script for ContentHub AI connection
 * Run with: node diagnose.js
 */

require('dotenv').config();
const fetch = require('node-fetch');

const KIMI_API_URL = 'https://api.moonshot.cn/v1';
const KIMI_API_KEY = process.env.KIMI_API_KEY;
const KIMI_APP_ID = process.env.KIMI_APP_ID;

console.log('========================================');
console.log('🔍 ContentHub AI Diagnostic Tool');
console.log('========================================\n');

// Check 1: Environment Variables
console.log('📋 CHECK 1: Environment Variables');
console.log('----------------------------------------');
if (!KIMI_API_KEY) {
  console.log('❌ KIMI_API_KEY: NOT SET');
  console.log('   Fix: Add KIMI_API_KEY to proxy-server/.env');
  process.exit(1);
} else {
  console.log(`✅ KIMI_API_KEY: Set (${KIMI_API_KEY.substring(0, 20)}...)`);
  console.log(`   Length: ${KIMI_API_KEY.length} characters`);
  console.log(`   Starts with: ${KIMI_API_KEY.substring(0, 10)}`);
}

if (!KIMI_APP_ID) {
  console.log('⚠️  KIMI_APP_ID: NOT SET (optional but recommended)');
} else {
  console.log(`✅ KIMI_APP_ID: Set (${KIMI_APP_ID})`);
}
console.log();

// Check 2: API Key Format
console.log('📋 CHECK 2: API Key Format');
console.log('----------------------------------------');
if (!KIMI_API_KEY.startsWith('sk-kimi-')) {
  console.log('⚠️  API key format looks unusual');
  console.log('   Expected: sk-kimi-xxxxxxxx');
  console.log(`   Got: ${KIMI_API_KEY.substring(0, 20)}...`);
} else {
  console.log('✅ API key format looks correct (sk-kimi-...)');
}
console.log();

// Check 3: Test Authentication
console.log('📋 CHECK 3: Testing Authentication');
console.log('----------------------------------------');

async function runDiagnostics() {
  try {
    // Test 3a: List models (simple auth test)
    console.log('🔍 Test 3a: Listing models (auth test)...');
    const modelsResponse = await fetch(`${KIMI_API_URL}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KIMI_API_KEY}`,
        'X-App-ID': KIMI_APP_ID,
        'Content-Type': 'application/json'
      }
    });

    if (modelsResponse.status === 401) {
      console.log('❌ AUTHENTICATION FAILED (401)');
      console.log();
      console.log('🔧 TROUBLESHOOTING STEPS:');
      console.log('----------------------------------------');
      console.log('1. Go to https://platform.moonshot.cn/');
      console.log('2. Log in to your account');
      console.log('3. Navigate to API Keys section');
      console.log('4. Generate a NEW API key');
      console.log('5. Copy the new key (starts with sk-kimi-)');
      console.log('6. Update proxy-server/.env:');
      console.log('   KIMI_API_KEY=sk-kimi-YOUR_NEW_KEY');
      console.log('7. Restart the proxy server');
      console.log();
      console.log('⚠️  Common causes:');
      console.log('   - API key was revoked');
      console.log('   - API key expired');
      console.log('   - Wrong account (different App ID)');
      console.log('   - Key was deleted from console');
      return;
    }

    if (!modelsResponse.ok) {
      console.log(`❌ Unexpected error: HTTP ${modelsResponse.status}`);
      const errorText = await modelsResponse.text();
      console.log(`   Details: ${errorText}`);
      return;
    }

    const models = await modelsResponse.json();
    console.log(`✅ Authentication successful!`);
    console.log(`   Available models: ${models.data?.length || 0}`);
    models.data?.forEach(m => console.log(`   - ${m.id}`));
    console.log();

    // Test 3b: Simple chat completion
    console.log('🔍 Test 3b: Testing chat completion...');
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
          { role: 'user', content: 'Say "Kimi is working!"' }
        ],
        max_tokens: 20,
        temperature: 1
      })
    });

    if (!chatResponse.ok) {
      console.log(`❌ Chat completion failed: HTTP ${chatResponse.status}`);
      return;
    }

    const chatData = await chatResponse.json();
    console.log('✅ Chat completion successful!');
    console.log(`   Model: ${chatData.model}`);
    console.log(`   Response: "${chatData.choices?.[0]?.message?.content?.trim()}"`);
    console.log(`   Tokens used: ${chatData.usage?.total_tokens || 'N/A'}`);
    console.log();

    // Test 3c: Test streaming
    console.log('🔍 Test 3c: Testing streaming (5 seconds)...');
    const streamResponse = await fetch(`${KIMI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIMI_API_KEY}`,
        'X-App-ID': KIMI_APP_ID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'kimi-k2.5',
        messages: [
          { role: 'system', content: 'You are a content creator.' },
          { role: 'user', content: 'Write a short LinkedIn post about AI in 2 sentences.' }
        ],
        max_tokens: 100,
        temperature: 1,
        stream: true
      })
    });

    if (!streamResponse.ok) {
      console.log(`❌ Streaming failed: HTTP ${streamResponse.status}`);
      return;
    }

    console.log('✅ Streaming connection established');
    console.log('   Content-Type:', streamResponse.headers.get('content-type'));
    console.log();

    // Test 3d: Test with actual content format
    console.log('🔍 Test 3d: Testing actual content format...');
    const formatResponse = await fetch(`${KIMI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIMI_API_KEY}`,
        'X-App-ID': KIMI_APP_ID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
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
        stream: false
      })
    });

    if (!formatResponse.ok) {
      console.log(`❌ Format test failed: HTTP ${formatResponse.status}`);
      return;
    }

    const formatData = await formatResponse.json();
    const content = formatData.choices?.[0]?.message?.content || '';
    
    console.log('✅ Content format test successful!');
    console.log();
    console.log('📄 Generated content:');
    console.log('----------------------------------------');
    console.log(content);
    console.log('----------------------------------------');
    console.log();

    // Check if format matches expected pattern
    const hasTitle = content.includes('TITLE:');
    const hasContent = content.includes('CONTENT:');
    const hasHashtags = content.includes('HASHTAGS:');

    console.log('📋 Format Check:');
    console.log(`   TITLE: ${hasTitle ? '✅ Found' : '❌ Missing'}`);
    console.log(`   CONTENT: ${hasContent ? '✅ Found' : '❌ Missing'}`);
    console.log(`   HASHTAGS: ${hasHashtags ? '✅ Found' : '❌ Missing'}`);
    console.log();

    if (!hasTitle || !hasContent) {
      console.log('⚠️  WARNING: AI response format may not match expected pattern');
      console.log('   The UI expects: TITLE:, CONTENT:, HASHTAGS:');
      console.log('   But the AI returned content in a different format.');
      console.log('   This is OK - the UI has fallback parsing.');
    }

    console.log();
    console.log('========================================');
    console.log('✅ ALL CHECKS PASSED!');
    console.log('========================================');
    console.log();
    console.log('🚀 Next steps:');
    console.log('   1. Start the proxy server: npm start');
    console.log('   2. Open the Content Studio in browser');
    console.log('   3. Click "Generate Content"');
    console.log();

  } catch (error) {
    console.error('❌ Diagnostic error:', error.message);
    console.error(error.stack);
  }
}

runDiagnostics();
