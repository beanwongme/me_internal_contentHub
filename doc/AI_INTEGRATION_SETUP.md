# ContentHub AI Integration - Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Frontend (React App)](#frontend-react-app)
3. [Proxy Server (Node.js)](#proxy-server-nodejs)
4. [Data Flow](#data-flow)
5. [Configuration](#configuration)
6. [API Reference](#api-reference)
7. [Error Handling](#error-handling)
8. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ContentHub System                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   ┌──────────────┐       ┌──────────────┐       ┌──────────────────┐   │
│   │   React App  │──────▶│ Proxy Server │──────▶│  Kimi AI API     │   │
│   │  (Frontend)  │◀──────│  (Node.js)   │◀──────│  (Moonshot)      │   │
│   └──────────────┘       └──────────────┘       └──────────────────┘   │
│         │                       │                                        │
│         │                       │                                        │
│         ▼                       ▼                                        │
│   ┌──────────────┐       ┌──────────────┐                               │
│   │  localStorage│       │  In-Memory   │                               │
│   │  (Settings)  │       │    Cache     │                               │
│   └──────────────┘       └──────────────┘                               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Components

| Component | Technology | Port | Purpose |
|-----------|-----------|------|---------|
| **React Frontend** | React + TypeScript + Vite | 5173 | UI for content generation |
| **Proxy Server** | Node.js + Express | 3001 | CORS bypass, caching, auth |
| **Kimi AI API** | Moonshot API | 443 (HTTPS) | AI content generation |

---

## Frontend (React App)

### File: `app/src/pages/ContentStudioPage.tsx`

Main content generation page with streaming support.

### Key Features

1. **Streaming Mode** (Real-time generation)
   - Content appears word-by-word
   - Shows token count, speed (tok/s)
   - Estimated completion time

2. **Non-Streaming Mode** (Complete response)
   - Content appears all at once
   - More reliable, fewer rate limits

3. **Mock Mode** (Testing)
   - Fake content for UI testing
   - No API calls

### State Management

```typescript
interface StreamingState {
  isStreaming: boolean;      // Currently generating?
  content: string;           // Generated text
  title: string;             // Parsed title
  hashtags: string[];        // Parsed hashtags
  isComplete: boolean;       // Generation complete?
  error?: string;            // Error message
  tokensReceived: number;    // Token count
  tokenRate: number;         // Tokens per second
  estimatedTotalTime: number; // ETA in seconds
}
```

### Content Generation Flow

```typescript
// 1. User clicks "Generate Content"
const handleGenerate = async () => {
  // Validate brief
  // Initialize streaming state
  // Call generateWithStreaming() for each channel
}

// 2. Send request to proxy
const generateWithStreaming = async (channelId: string) => {
  const requestBody = {
    model: 'kimi-k2.5',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 1500,      // Channel-specific
    temperature: 1,        // Kimi K2.5 requires exactly 1
    stream: USE_STREAMING  // true/false based on setting
  }
  
  const response = await fetch('http://localhost:3001/api/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  })
}

// 3. Handle stream response (if streaming enabled)
const handleStreamResponse = async (channelId, response, maxTokens) => {
  const reader = response.body?.getReader()
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    
    // Parse SSE chunks
    // Extract content or reasoning_content
    // Update UI in real-time
  }
}

// 4. Handle non-stream response (if streaming disabled)
const handleNonStreamResponse = async (channelId, response) => {
  const data = await response.json()
  const content = data.choices[0]?.message?.content
  // Display complete content
}
```

### Channel Configuration

```typescript
const CHANNEL_CONFIG = {
  twitter:   { maxTokens: 400,  characterLimit: 280 },
  thread:    { maxTokens: 500,  characterLimit: 500 },
  instagram: { maxTokens: 800,  characterLimit: 2200 },
  linkedin:  { maxTokens: 1500, characterLimit: 3000 },
  facebook:  { maxTokens: 2000, characterLimit: 63206 }
}
```

### Feature Toggles

| Toggle | Location | Default | Description |
|--------|----------|---------|-------------|
| `USE_MOCK_MODE` | localStorage / .env | `false` | Generate fake content |
| `USE_STREAMING` | localStorage / .env | `true` | Real-time streaming |

```typescript
// How to toggle via browser console:
localStorage.setItem('mock_mode', 'true')     // Enable mock
localStorage.setItem('use_streaming', 'false') // Disable streaming
location.reload()
```

---

## Proxy Server (Node.js)

### File: `proxy-server/server.js`

Express server that forwards requests to Kimi API, bypassing CORS.

### Purpose

1. **CORS Bypass** - Browser blocks direct API calls to moonshot.cn
2. **Authentication** - Adds API key server-side (not exposed to frontend)
3. **Caching** - Caches responses for 10 minutes
4. **Logging** - Request/response logging for debugging
5. **Error Handling** - Proper error messages for frontend

### Configuration

```javascript
// proxy-server/.env
AI_PROVIDER=kimi
KIMI_API_KEY=sk-Qu6ykuJb7Gkg7nIph...
KIMI_APP_ID=ak-f8me838r8yq111ejdbd1
PORT=3001
CACHE_TTL_MINUTES=10
MAX_CACHE_SIZE=200
```

### Key Features

```javascript
// 1. CORS enabled for all origins
cors()

// 2. In-memory cache
const cache = new Map()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

// 3. Request logging
console.log(`[STREAM] ${channelId} → ${targetUrl}`)

// 4. Error handling
if (response.status === 429) {
  return res.status(429).json({
    error: 'Rate limit exceeded',
    message: 'Too many requests'
  })
}

if (response.status === 503) {
  return res.status(503).json({
    error: 'Kimi API overloaded',
    message: 'Engine overloaded, try again later'
  })
}
```

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check + stats |
| `/test/kimi-connection` | GET | Test API connection |
| `/cache/stats` | GET | Cache statistics |
| `/cache/clear` | POST | Clear cache |
| `/stats/tokens` | GET | Token usage stats |
| `/api/chat/completions` | POST | **Main endpoint** - Generate content |
| `/api/models` | GET | List available models |

### Main Proxy Logic

```javascript
app.post('/api/*', async (req, res) => {
  const isStreaming = req.body.stream === true
  const targetUrl = `${KIMI_API_URL}/${req.params[0]}`
  
  // Check cache (only for non-streaming)
  if (!isStreaming) {
    const cached = cache.get(cacheKey)
    if (cached) return res.json(cached.data)
  }
  
  // Forward to Kimi API
  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KIMI_API_KEY}`,
      'X-App-ID': KIMI_APP_ID,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  })
  
  // Handle errors
  if (!response.ok) {
    return res.status(response.status).json({ error: '...' })
  }
  
  // Stream response back
  if (isStreaming) {
    res.setHeader('Content-Type', 'text/event-stream')
    response.body.pipe(res)
  } else {
    const data = await response.json()
    cache.set(cacheKey, { data, timestamp: Date.now() })
    res.json(data)
  }
})
```

### Error Handling

| Status Code | Error | Cause | Solution |
|-------------|-------|-------|----------|
| 401 | Invalid Authentication | API key invalid/expired | Regenerate key in Moonshot console |
| 429 | Rate Limited | Too many requests | Wait 1 minute, disable streaming |
| 503 | Engine Overloaded | Kimi servers busy | Wait 5-10 minutes |
| 500 | Proxy Error | Server error | Restart proxy server |

---

## Data Flow

### Streaming Mode

```
1. User clicks "Generate Content"
   ↓
2. Frontend sends POST /api/chat/completions
   Body: { stream: true, ... }
   ↓
3. Proxy forwards to Kimi API
   Headers: Authorization, X-App-ID
   ↓
4. Kimi starts generating content
   Returns SSE stream (text/event-stream)
   ↓
5. Proxy pipes stream to frontend
   ↓
6. Frontend reads chunks via reader.read()
   Decodes: data: {"choices":[{"delta":{"content":"..."}}]}
   ↓
7. Frontend updates UI in real-time
   Shows word-by-word generation
   ↓
8. Stream ends (data: [DONE])
   Frontend shows "Complete"
```

### Non-Streaming Mode

```
1. User clicks "Generate Content"
   ↓
2. Frontend sends POST /api/chat/completions
   Body: { stream: false, ... }
   ↓
3. Proxy forwards to Kimi API
   ↓
4. Kimi generates complete content
   Returns JSON: { choices: [{ message: { content: "..." } }] }
   ↓
5. Proxy caches response (10 min TTL)
   ↓
6. Proxy returns JSON to frontend
   ↓
7. Frontend displays complete content
```

---

## Configuration

### Frontend (app/.env)

```bash
# Proxy Server URL
VITE_KIMI_API_URL=http://localhost:3001/api

# AI Provider Settings
VITE_AI_API_KEY=sk-Qu6ykuJb7Gkg7nIph...
VITE_AI_MODEL=kimi-k2.5
VITE_AI_BASE_URL=https://api.moonshot.cn/v1
VITE_AI_APP_ID=ak-f8me838r8yq111ejdbd1

# Performance Settings
VITE_AI_TEMPERATURE=0.8
VITE_USE_STREAMING=true          # Enable/disable streaming
VITE_AI_CACHE_TTL_MINUTES=10
```

### Proxy Server (proxy-server/.env)

```bash
# Provider Selection
AI_PROVIDER=kimi

# Kimi Credentials
KIMI_API_KEY=sk-Qu6ykuJb7Gkg7nIph...
KIMI_APP_ID=ak-f8me838r8yq111ejdbd1

# Cache Settings
CACHE_TTL_MINUTES=10
MAX_CACHE_SIZE=200

# Server Port
PORT=3001
```

---

## API Reference

### Request Format

```typescript
POST /api/chat/completions
Content-Type: application/json

{
  "model": "kimi-k2.5",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert content creator..."
    },
    {
      "role": "user", 
      "content": "Create content for: AI in Healthcare..."
    }
  ],
  "max_tokens": 1500,
  "temperature": 1,
  "stream": true  // or false
}
```

### Streaming Response (SSE)

```
Content-Type: text/event-stream

data: {"choices":[{"delta":{"role":"assistant"}}]}

data: {"choices":[{"delta":{"content":"TITLE"}}]}

data: {"choices":[{"delta":{"content":":"}}]}

data: {"choices":[{"delta":{"content":" AI"}}]}

data: {"choices":[{"delta":{"content":" Ethics"}}]}
...
data: [DONE]
```

### Non-Streaming Response (JSON)

```json
{
  "id": "chatcmpl-xxx",
  "object": "chat.completion",
  "model": "kimi-k2.5",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "TITLE: AI Ethics in Healthcare\n\nCONTENT:..."
    },
    "finish_reason": "stop"
  }],
  "usage": {
    "prompt_tokens": 150,
    "completion_tokens": 450,
    "total_tokens": 600
  }
}
```

---

## Error Handling

### Frontend Error Display

```typescript
// Rate limit (429)
if (error.includes('429')) {
  showMessage('⚠️ Rate Limited - Wait 1 minute')
}

// Overloaded (503)
if (error.includes('overloaded')) {
  showMessage('⚠️ Kimi servers overloaded - Try later')
}

// Authentication (401)
if (error.includes('401')) {
  showMessage('❌ API Key invalid - Check configuration')
}
```

### Retry Logic

```typescript
const fetchWithRetry = async (url, options, maxRetries = 3) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, options)
    
    if (response.status === 429) {
      // Wait 1s, 2s, 4s before retry
      const delay = Math.pow(2, attempt) * 1000
      await sleep(delay)
      continue
    }
    
    return response
  }
}
```

---

## Troubleshooting

### Problem: Content is truncated

**Symptoms:** Content ends abruptly like "Here are three pillars..."

**Cause:** `max_tokens` limit reached

**Solutions:**
1. Increase `max_tokens` in `CHANNEL_CONFIG`
2. Use non-streaming mode (more reliable)
3. Generate shorter content

### Problem: 429 Rate Limit errors

**Symptoms:** "Too Many Requests" error

**Solutions:**
1. Disable streaming mode (sends fewer requests)
2. Wait 1 minute between requests
3. Generate fewer channels at once
4. Enable mock mode for testing

### Problem: Empty content

**Symptoms:** "Model returned empty content"

**Cause:** Model only output `reasoning_content`, not `content`

**Solutions:**
1. Check console for `finish_reason`
2. Increase `max_tokens` 
3. Try simpler topic/objective
4. Switch to `moonshot-v1-128k` model

### Problem: CORS errors

**Symptoms:** "CORS policy: No 'Access-Control-Allow-Origin'"

**Solutions:**
1. Ensure proxy server is running on port 3001
2. Check `VITE_KIMI_API_URL` points to proxy
3. Restart proxy server

---

## Quick Start

### 1. Start Proxy Server

```bash
cd proxy-server
npm install
npm start
```

### 2. Start Frontend

```bash
cd app
npm install
npm run dev
```

### 3. Test Connection

```bash
curl http://localhost:3001/test/kimi-connection
```

### 4. Open in Browser

```
http://localhost:5173/social-content/studio
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `app/src/pages/ContentStudioPage.tsx` | Main content generation UI |
| `app/src/pages/KimiTestPage.tsx` | Test/debug page |
| `app/src/services/kimiAi.ts` | AI service layer |
| `proxy-server/server.js` | Proxy server |
| `proxy-server/.env` | Proxy configuration |
| `app/.env` | Frontend configuration |

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-03  
**Status:** Active
