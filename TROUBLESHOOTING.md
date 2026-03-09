# Content Generation Troubleshooting Guide

## Problem: "Click Generate Content to start" Not Working

### Quick Diagnosis Steps

#### 1. Check Browser Console (F12)
Open browser DevTools and look for these messages:

**Expected (Working):**
```
[handleGenerate] Starting generation... {channels: ['linkedin'], useMockMode: false}
[Generate] Channel: linkedin, max_tokens: 1000
[Generate] API URL: http://localhost:3001/api
[Generate] API Key exists: true
```

**Problem (Proxy Not Running):**
```
[Generate] API URL: http://localhost:3001/api
[Generate] Error caught: TypeError: Failed to fetch
```

**Problem (Wrong API URL):**
```
[Generate] API URL: https://api.moonshot.cn/v1
[Generate] Error caught: CORS error
```

#### 2. Check Proxy Server is Running

In your terminal, you should see:
```
🚀 ContentHub Kimi AI Proxy Server
📡 Server running on http://localhost:3001
```

If not, start it:
```bash
cd proxy-server
npm start
```

#### 3. Check Environment Variables

**File: `app/.env`**
```env
VITE_KIMI_API_URL=http://localhost:3001/api  ← Must be localhost:3001
VITE_KIMI_API_KEY=sk-kimi-...                ← Your API key
```

**Common Mistake:**
```env
VITE_KIMI_API_URL=https://api.moonshot.cn/v1  ← WRONG! This causes CORS
```

#### 4. Check Network Tab

In DevTools → Network tab:
1. Click "Generate Content"
2. Look for request to `chat/completions`
3. Check status:
   - **200**: Working
   - **404**: Wrong endpoint
   - **500**: Proxy error
   - **CORS error**: Wrong API URL

---

## Common Issues & Fixes

### Issue 1: Proxy Server Not Running

**Symptom:** Console shows "Failed to fetch"

**Fix:**
```bash
# Terminal 1
cd proxy-server
npm start

# Terminal 2  
cd app
npm run dev
```

### Issue 2: CORS Error (Wrong API URL)

**Symptom:** Console shows CORS policy error

**Fix:**
Edit `app/.env`:
```env
# WRONG
VITE_KIMI_API_URL=https://api.moonshot.cn/v1

# CORRECT
VITE_KIMI_API_URL=http://localhost:3001/api
```

Then restart the React dev server.

### Issue 3: API Key Missing

**Symptom:** Console shows "API Key exists: false"

**Fix:**
Check `proxy-server/.env`:
```env
KIMI_API_KEY=sk-kimi-zITebxbZyZvau9NM8vh9YNS36NIvBMTrBtxliTfXd2167jT2axmL5SX9aMudoNc9
```

### Issue 4: Generation Stuck (No Error)

**Symptom:** "Generating..." badge shows but no content appears

**Fix:**
1. Check proxy server logs for errors
2. Check if Kimi API is responding:
   ```bash
   curl http://localhost:3001/health
   ```
3. Check if models endpoint works:
   ```bash
   curl http://localhost:3001/api/models
   ```

### Issue 5: Error Not Showing

**Symptom:** Clicking generate does nothing, no error shown

**Fix:** This was a bug. Now errors show with a retry button.

---

## Testing Checklist

- [ ] Proxy server running on port 3001
- [ ] React app running on port 5173
- [ ] `app/.env` has `VITE_KIMI_API_URL=http://localhost:3001/api`
- [ ] `proxy-server/.env` has valid `KIMI_API_KEY`
- [ ] Browser console shows no CORS errors
- [ ] Network tab shows 200 for `chat/completions`

---

## Debug Mode

Add this to browser console to enable verbose logging:
```javascript
localStorage.setItem('debug', 'true');
```

Then refresh and try generating again.

---

## Emergency Fallback

If streaming doesn't work, switch to mock mode:

**File: `ContentStudioPage.tsx`**
```typescript
const USE_MOCK_MODE = true;  // Change from false to true
```

This uses instant mock responses instead of the API.

---

## Contact Support

If none of these work:
1. Open browser console (F12)
2. Screenshot any red error messages
3. Check proxy server terminal for errors
4. Share both screenshots
