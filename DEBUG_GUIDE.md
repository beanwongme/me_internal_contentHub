# Content Generation Debug Guide

## Current Issue: "Click Generate Content to start" / Only "TITLE" showing

## Step 1: Check Proxy Server Console

Look for these messages when you click "Generate":

```
[STREAM] LinkedIn → https://api.moonshot.cn/v1/chat/completions
[CONFIG] max_tokens: 600, temperature: 0.8, model: kimi-k2.5
[AUTH] Using API Key: sk-kimi-zITebxb...
[API] Response status: 200 in 850ms
[STREAM] Completed in 6500ms
```

**If you see `[API] Response status: 401`:**
- Your API key is invalid/expired
- Go to https://platform.moonshot.cn/ and generate a new key
- Update `proxy-server/.env` with the new key

## Step 2: Check Browser Console (F12)

Look for these messages:
```
[Generate] Channel: linkedin, max_tokens: 600
[Generate] API URL: http://localhost:3001/api
[Generate] Using proxy server (auth handled server-side)
```

**If you see an error like `Failed to fetch`:**
- Proxy server is not running
- Start it: `cd proxy-server && npm start`

## Step 3: Test Direct Connection

Run this in your terminal:
```bash
cd proxy-server
node test-kimi.js
```

**Expected output:**
```
✅ Success!
💬 Response: "Kimi API is working!"
```

**If you see 401 error:**
- The API key is definitely invalid
- Get a new one from Moonshot console

## Step 4: Quick Fixes to Try

### Fix 1: Use Mock Mode (for testing UI)
In `app/src/pages/ContentStudioPage.tsx`, change:
```typescript
const USE_MOCK_MODE = false;  // Change to true
```
This will generate fake content instantly to test the UI.

### Fix 2: Clear Cache and Restart
```bash
# Stop proxy server (Ctrl+C)
# Restart proxy server
cd proxy-server
npm start

# Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
```

### Fix 3: Check Environment Variables
Make sure these files have correct values:

**proxy-server/.env:**
```env
AI_PROVIDER=kimi
KIMI_API_KEY=sk-kimi-YOUR_VALID_KEY_HERE
KIMI_APP_ID=19c8dd6a-2132-8926-8000-00003738ca6d
```

**app/.env:**
```env
VITE_KIMI_API_URL=http://localhost:3001/api
```

## Step 5: Add Frontend Debug Logging

If the above doesn't work, add this to the browser console (F12) before clicking Generate:

```javascript
// Enable verbose logging
localStorage.setItem('debug', 'true');
```

Then check for:
- `Parsed content:` logs showing the actual AI response
- `Stream chunk:` logs showing raw data

## Most Likely Cause

Based on your symptoms ("TITLE" showing but no content), the issue is most likely:

1. **401 Authentication Error** - API key is invalid
2. **Stream parsing error** - AI response format doesn't match expected pattern

### To fix 401 error:
1. Go to https://platform.moonshot.cn/
2. Generate a new API key
3. Update `proxy-server/.env`
4. Restart proxy server

### To verify stream parsing:
Add this log in `handleStreamResponse` (around line 227):
```typescript
console.log('Received content:', JSON.stringify(content));
console.log('Full content so far:', JSON.stringify(fullContent));
```
