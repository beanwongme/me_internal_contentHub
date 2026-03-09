# Kimi API Overloaded - Fix Guide

## Current Status

```
❌ Kimi API Status: OVERLOADED (503 Error)
🔴 Error: engine_overloaded_error
📅 Time: 2026-03-03
```

Kimi's servers are experiencing high traffic and cannot process requests right now.

---

## Quick Fix: Use Mock Mode (30 seconds)

**For testing the UI immediately:**

1. **Open browser console** (F12)
2. **Paste this:**
   ```javascript
   localStorage.setItem('mock_mode', 'true');
   location.reload();
   ```
3. **Click "Generate Content"**

✅ You'll see fake content generated instantly!

**To disable mock mode later:**
```javascript
localStorage.setItem('mock_mode', 'false');
location.reload();
```

---

## Alternative: Switch to Different Model (2 minutes)

The `kimi-k2.5` model is overloaded. Use `moonshot-v1-128k` instead:

### Step 1: Edit proxy-server/.env
```env
# Change this:
# KIMI_MODEL=kimi-k2.5

# To this:
KIMI_MODEL=moonshot-v1-128k
```

### Step 2: Restart proxy server
```bash
# Kill old server
taskkill /F /IM node.exe

# Start new server
cd proxy-server
npm start
```

### Step 3: Hard refresh browser (Ctrl+Shift+R)

---

## Option: Just Wait

Kimi usually recovers within 5-10 minutes. The error will clear automatically.

**Check status:**
```bash
curl http://localhost:3001/test/kimi-connection
```

If it shows `success: true`, the overload is cleared.

---

## What I Changed

### 1. Better Error Messages
- UI now shows helpful suggestions when overloaded
- Explains it's a server issue, not a code bug

### 2. Mock Mode Toggle
- Added checkbox in UI to enable/disable mock mode
- Persists in localStorage

### 3. Proxy Server Improvements
- Better logging for debugging
- Handles 503 errors gracefully

---

## Comparison: Models

| Model | Speed | Quality | Status |
|-------|-------|---------|--------|
| **kimi-k2.5** | Slow | Best | 🔴 Overloaded |
| **moonshot-v1-128k** | Fast | Good | 🟢 Available |
| **Mock Mode** | Instant | Fake | 🟢 Always works |

---

## Need Help?

If nothing works:

1. **Check proxy logs** for exact error
2. **Test directly:** `cd proxy-server && node diagnose.js`
3. **Try in 10 minutes** when Kimi recovers

---

## Summary

| Problem | Solution | Time |
|---------|----------|------|
| UI testing | Mock mode | 30 sec |
| Real content | Switch to moonshot-v1-128k | 2 min |
| Best quality | Wait for kimik-2.5 to recover | 5-10 min |
