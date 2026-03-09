# Kimi AI Troubleshooting Guide

## Quick Diagnostic Steps

### 1. Access the Test Page
Navigate to **`/test/kimi`** in your app (e.g., `http://localhost:5173/test/kimi`)

This page provides:
- Configuration status check
- Connection test to Kimi API
- Real API test generation
- Debug logs
- Common issues guide

### 2. Check Settings Page
Go to **Settings → AI Agents** to see:
- Kimi AI connection status badge
- Error messages if any
- "Test Connection" button

---

## Common Issues & Solutions

### Issue 1: "API key is missing" or Configuration Not Loading

**Symptoms:**
- Test page shows "Missing" for App ID or API Key
- `.env` file exists but values not loaded

**Solution:**
1. **Restart the dev server** - Vite only loads `.env` at startup:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Verify .env file location** - Must be at `app/.env` (not root):
   ```
   contentHub/
   └── app/
       ├── .env          <-- Here
       ├── src/
       └── ...
   ```

3. **Check .env syntax** - No quotes needed:
   ```env
   # Correct
   VITE_KIMI_API_KEY=sk-kimi-...
   
   # Wrong (don't use quotes)
   VITE_KIMI_API_KEY="sk-kimi-..."
   ```

---

### Issue 2: CORS Policy Error (Most Common) ⚠️

**Symptoms:**
- Error message shows: `[CORS or Network] Cannot connect to Kimi API`
- Status check returns: `Kimi AI service is unreachable`
- Browser console shows: 
  ```
  Access to fetch at 'https://api.moonshot.cn/...' from origin 'http://localhost:5173' 
  has been blocked by CORS policy
  ```

**Why this happens:** The Kimi API blocks direct browser requests for security reasons.

**Solution - Use the Backend Proxy (Recommended):**

We've included a proxy server in the `proxy-server/` folder:

```bash
# 1. Open a new terminal and navigate to proxy-server
cd proxy-server

# 2. Install dependencies
npm install

# 3. The .env file is already configured with your credentials

# 4. Start the proxy server
npm start
```

You should see:
```
🚀 ContentHub Kimi AI Proxy Server
📡 Server running on http://localhost:3001
```

Then update your frontend to use the proxy:

```bash
# Edit app/.env
VITE_KIMI_API_URL=http://localhost:3001/api

# Restart the React dev server
cd app
npm run dev
```

That's it! The proxy will forward all Kimi API requests, bypassing CORS.

**Alternative - Use Mock Mode for Development:**

If you don't want to run the proxy, keep mock mode enabled:

```typescript
// In ContentStudioPage.tsx and BriefPage.tsx
const USE_MOCK_MODE = true;  // Keep this during development
```

---

### Issue 3: 401 Unauthorized

**Symptoms:**
- Status check shows "401 Unauthorized"
- Error: "Invalid API key"

**Solution:**
1. Verify your API key is correct in `proxy-server/.env` (if using proxy)
2. Check if the API key has expired
3. Ensure the key has quota/credits available

---

### Issue 4: Network Error / Service Unreachable

**Symptoms:**
- "Kimi AI service is unreachable"
- Network timeout errors

**Solution:**
1. Check internet connection
2. Verify firewall isn't blocking api.moonshot.cn
3. Try accessing the API directly:
   ```bash
   curl -H "Authorization: Bearer YOUR_API_KEY" \
        https://api.moonshot.cn/v1/models
   ```

---

## Testing the Connection

### Method 1: Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to `/test/kimi`
4. Click "Check Connection"
5. Look for logs starting with `[Kimi AI]`

### Method 2: Command Line
```bash
# Test if API is reachable
curl -H "Authorization: Bearer sk-kimi-zITebxbZyZvau9NM8vh9YNS36NIvBMTrBtxliTfXd2167jT2axmL5SX9aMudoNc9" \
     https://api.moonshot.cn/v1/models
```

Expected response:
```json
{
  "object": "list",
  "data": [
    {
      "id": "kimi-k2.5",
      "object": "model",
      "created": 1714720800,
      "owned_by": "moonshot"
    }
  ]
}
```

### Method 3: Test with Proxy
```bash
# Start the proxy first
cd proxy-server
npm start

# Then test
curl http://localhost:3001/health
curl http://localhost:3001/api/models
```

---

## Debug Mode

Enable detailed logging by opening browser console:

```javascript
// In browser console, you should see:
[Kimi AI] Configuration loaded:
[Kimi AI] API URL: http://localhost:3001/api  (proxy URL)
[Kimi AI] Model: kimi-k2.5
[Kimi AI] App ID exists: true
[Kimi AI] API Key exists: true
```

---

## Quick Fix Checklist

1. [ ] Restart dev server after editing .env
2. [ ] Check browser console for CORS errors
3. [ ] **Start the proxy server** (if using real API)
4. [ ] Verify API key hasn't expired
5. [ ] Test with mock mode first
6. [ ] Check network tab for request details
7. [ ] Use `/test/kimi` page for diagnostics

---

## Architecture Overview

### With Proxy (Recommended)
```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Browser   │ ───► │ Proxy Server│ ───► │  Kimi API   │
│  (React App)│      │ (localhost) │      │(moonshot.cn)│
└─────────────┘      └─────────────┘      └─────────────┘
```

### Mock Mode (Development Only)
```
┌─────────────┐
│   Browser   │ ──► Mock Response (No API call)
│  (React App)│
└─────────────┘
```

---

## Need Help?

1. Check the **Network tab** in browser DevTools
2. Look for the request to `api.moonshot.cn` or `localhost:3001`
3. Note the HTTP status code and response
4. Common codes:
   - **200**: Success
   - **401**: Invalid API key
   - **403**: Forbidden (CORS or permissions)
   - **429**: Rate limited
   - **500**: Server error

---

## Production Deployment

For production, deploy the proxy server:

1. **Option A**: Use a serverless function (Vercel, Netlify Functions, AWS Lambda)
2. **Option B**: Deploy to a VPS/Dedicated server
3. **Option C**: Use an API Gateway with CORS support

See `proxy-server/README.md` for Docker deployment instructions.
