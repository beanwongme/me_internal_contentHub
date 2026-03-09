# Kimi AI Proxy Server Setup Guide

## Overview
The proxy server solves CORS issues by forwarding requests from your browser to the Kimi AI API.

```
Browser (React App) → Proxy Server (localhost:3001) → Kimi API (moonshot.cn)
```

## Quick Start

### Step 1: Start the Proxy Server

**Option A: Double-click the batch file**
```
Double-click: start-proxy.bat
```

**Option B: Use terminal**
```bash
cd proxy-server
npm start
```

You should see:
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

⚠️  To use this proxy, update your app:
   Set VITE_KIMI_API_URL=http://localhost:3001/api in app/.env
========================================
```

**Keep this terminal window open!**

---

### Step 2: Start the React App (New Terminal)

**Option A: Double-click the batch file**
```
Double-click: start-app.bat
```

**Option B: Use terminal**
```bash
cd app
npm run dev
```

---

### Step 3: Test the Connection

1. Open your browser to: `http://localhost:5173/test/kimi`
2. Click **"Check Connection"**
3. You should see: ✅ **Kimi AI (K2.5) is available**

---

## Troubleshooting

### "Port 3001 is already in use"
Kill the existing process or change the port in `proxy-server/.env`:
```env
PORT=3002
```

Then update `app/.env`:
```env
VITE_KIMI_API_URL=http://localhost:3002/api
```

### "Cannot find module 'express'"
Install dependencies first:
```bash
cd proxy-server
npm install
```

### Connection still fails
1. Make sure BOTH servers are running (proxy in terminal 1, app in terminal 2)
2. Check the proxy terminal for error messages
3. Verify the `.env` files are correctly configured

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  React App (http://localhost:5173)                  │   │
│  │  - Makes request to localhost:3001/api              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP (CORS OK - same origin)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    PROXY SERVER                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Node.js + Express (http://localhost:3001)          │   │
│  │  - Receives request from browser                    │   │
│  │  - Adds API key                                     │   │
│  │  - Forwards to Kimi API                             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS (Server-to-Server)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     KIMI API                                │
│           https://api.moonshot.cn/v1                        │
└─────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
contentHub/
├── proxy-server/           # Proxy server folder
│   ├── .env               # API credentials (already configured)
│   ├── server.js          # Main server file
│   ├── package.json       # Dependencies
│   └── README.md          # Detailed proxy docs
├── app/                   # React app
│   ├── .env              # Updated to use proxy URL
│   └── ...
├── start-proxy.bat        # Quick start proxy
├── start-app.bat          # Quick start app
└── SETUP-PROXY.md         # This file
```

---

## Production Deployment

For production, deploy the proxy server to your backend:

1. **Vercel/Railway/Render**: Deploy `proxy-server/` as a Node.js service
2. **Docker**: See `proxy-server/README.md` for Docker instructions
3. **Cloud Functions**: AWS Lambda, Google Cloud Functions, Azure Functions

Then update `VITE_KIMI_API_URL` to your deployed proxy URL.

---

## Need Help?

1. Check the proxy server terminal for error messages
2. Visit `/test/kimi` in the app for diagnostics
3. Check browser console for network errors
4. Verify both `.env` files have correct values
