# Debug Steps - 0 Tokens Issue

## Current Status
Proxy server is running with enhanced logging. The issue is the stream completes with 0 tokens.

## What I Added

### 1. Frontend Logging (ContentStudioPage.tsx)
- Logs when fetch starts and response received
- Logs every raw chunk from the stream
- Logs parsed data structure
- Logs completion stats

### 2. Backend Logging (proxy-server/server.js)
- Logs first 3 chunks from Kimi API
- Shows chunk size and preview
- Logs total chunk count on completion
- Better error handling for non-OK responses

## Test Steps

### Step 1: Open Browser Console
Press **F12** → Click **Console** tab

### Step 2: Clear Console
Press **Ctrl+L** or click the 🚫 clear button

### Step 3: Click "Generate Content"

### Step 4: Watch for these logs in order:

**Expected Log Sequence:**
```
[Generate] Fetching from http://localhost:3001/api/chat/completions...
[Generate] Response received: {status: 200, ok: true, contentType: "text/event-stream", ...}
[Stream linkedin] Starting stream read...
[Stream linkedin] Raw chunk received: 512 chars
[Stream linkedin] Parsed data: {...}
[Stream linkedin] Content chunk #0: "TITLE: AI Ethics..."
...
[Stream linkedin] COMPLETE:
  Total tokens: 145
  Content length: 1200
```

**If you see:**
```
[Generate] Response received: {status: 401, ok: false, ...}
```
→ API key issue. Run `node diagnose.js` in proxy-server folder.

**If you see:**
```
[Generate] Response received: {status: 200, ...}
[Stream linkedin] Starting stream read...
[Stream linkedin] COMPLETE:
  Total tokens: 0
```
→ Stream is empty. Check proxy server console for errors.

## Check Proxy Server Console

Look for these messages in the terminal where you ran `npm start`:

**Good:**
```
[STREAM] LinkedIn → https://api.moonshot.cn/v1/chat/completions
[STREAM] Chunk #1 from Kimi: 256 chars
[STREAM] Preview: data: {"choices":[{"delta":{"content":"TITLE"}}]}
[STREAM] Chunk #2 from Kimi: 312 chars
...
[STREAM] Completed in 8500ms, 45 chunks
```

**Bad:**
```
[API ERROR] Kimi returned HTTP 401
→ API key invalid

[STREAM] Completed in 100ms, 0 chunks
→ Kimi returned empty stream (check API limits/quota)
```

## Quick Fixes to Try

### Fix 1: Test Direct API Connection
```bash
cd proxy-server
node diagnose.js
```
Should show successful chat completion with content.

### Fix 2: Use Mock Mode (Test UI)
In browser console:
```javascript
localStorage.setItem('mock_mode', 'true');
location.reload();
```
Then click Generate - should show fake content.

### Fix 3: Check Kimi API Quota
Visit: https://platform.moonshot.cn/
Check if you have available quota/tokens.

### Fix 4: Try Non-Streaming
Temporarily disable streaming to see if that works:
In ContentStudioPage.tsx, change:
```typescript
stream: true  // to → stream: false
```

## Most Likely Causes

1. **Kimi API returning empty response** - Check quota/limits
2. **Stream parsing error** - Check browser console for parse errors
3. **Network/proxy issue** - Check proxy console for connection errors

## Need More Help?

Run this and share the output:
```bash
cd proxy-server
curl http://localhost:3001/test/kimi-connection
```
