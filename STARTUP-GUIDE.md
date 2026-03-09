# 🚀 ContentHub Kimi AI Proxy - Quick Start

## ✅ Setup Complete!

Your proxy server is configured and ready. Here's how to start everything:

---

## 📋 Step-by-Step Startup

### Step 1: Start the Proxy Server

**Double-click this file:**
```
📁 contentHub/
└── 🚀 start-proxy.bat     <-- Double-click this
```

**Or use terminal:**
```bash
cd e:\project\contentHub\proxy-server
npm start
```

✅ **Success indicator:** You should see:
```
🚀 ContentHub Kimi AI Proxy Server
📡 Server running on http://localhost:3001
```

💡 **Keep this terminal window open!**

---

### Step 2: Start the React App

Open a **NEW terminal window** and run:

**Double-click this file:**
```
📁 contentHub/
└── 🚀 start-app.bat       <-- Double-click this
```

**Or use terminal:**
```bash
cd e:\project\contentHub\app
npm run dev
```

✅ **Success indicator:** You should see:
```
VITE v7.3.0  ready
➜  Local:   http://localhost:5173/
```

---

### Step 3: Test the Connection

1. Open browser: http://localhost:5173/test/kimi
2. Click **"Check Connection"**
3. Expected result: ✅ **Kimi AI (K2.5) is available**

---

## 📁 What Was Set Up

| File | Purpose |
|------|---------|
| `proxy-server/.env` | API credentials configured ✅ |
| `proxy-server/server.js` | Proxy server code ✅ |
| `app/.env` | Updated to use proxy URL ✅ |
| `start-proxy.bat` | Quick-start proxy server ✅ |
| `start-app.bat` | Quick-start React app ✅ |

---

## 🔧 Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Your Browser  │ ──────► │  Proxy Server   │ ──────► │   Kimi AI API   │
│  localhost:5173 │         │  localhost:3001 │         │ moonshot.cn/v1  │
│                 │         │                 │         │                 │
│  • React App    │  HTTP   │  • Node.js      │  HTTPS  │  • K2.5 Model   │
│  • Makes req    │ ──────► │  • No CORS      │ ──────► │  • AI Generate  │
│    to proxy     │         │  • Adds API key │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

---

## 🧪 Testing

### Test 1: Proxy Health Check
Open browser: http://localhost:3001/health

Expected:
```json
{
  "status": "ok",
  "service": "ContentHub Kimi Proxy"
}
```

### Test 2: Models List
Open browser: http://localhost:3001/api/models

Expected:
```json
{
  "object": "list",
  "data": [{"id": "kimi-k2.5", ...}]
}
```

### Test 3: App Test Page
Open browser: http://localhost:5173/test/kimi

Expected: Green "Connected" status

---

## 🐛 Troubleshooting

### Problem: "Port 3001 is already in use"
**Solution:** Kill the existing node process or change port in `proxy-server/.env`

### Problem: "Cannot connect to Kimi API" (CORS error still showing)
**Solution:** Make sure you have BOTH terminals running:
- Terminal 1: Proxy server running (`npm start` in proxy-server)
- Terminal 2: React app running (`npm run dev` in app)

### Problem: "API key not found"
**Solution:** Check that `proxy-server/.env` exists and has the API key

---

## 📊 Expected Terminal Output

### Proxy Server Terminal:
```
========================================
🚀 ContentHub Kimi AI Proxy Server
========================================
📡 Server running on http://localhost:3001
🔗 Target API: https://api.moonshot.cn/v1
🔑 API Key: sk-kimi-zITe...

📋 Available endpoints:
   - Health check: http://localhost:3001/health
   - API proxy:    http://localhost:3001/api/chat/completions
   - Models:       http://localhost:3001/api/models
========================================
```

### React App Terminal:
```
VITE v7.3.0  ready in 429 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## ✅ You're Ready!

Once both servers are running:
1. Go to http://localhost:5173/content-studio
2. Create a content brief
3. Click **"Generate Content"**
4. The Kimi K2.5 AI will generate real content through the proxy! 🎉

---

## 📖 More Documentation

- Detailed proxy docs: `proxy-server/README.md`
- Troubleshooting: `doc/kimi-ai-troubleshooting.md`
- Integration guide: `doc/kimi-ai-integration.md`
