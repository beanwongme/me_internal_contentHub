# ContentHub Kimi AI Proxy Server

This proxy server solves the CORS (Cross-Origin Resource Sharing) issue when calling the Kimi AI API directly from a browser.

## Problem

The Kimi API (`https://api.moonshot.cn`) does not allow direct requests from browsers due to CORS policy. When you try to call it from your React app, you get:

```
Access to fetch at 'https://api.moonshot.cn/...' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

## Solution

This proxy server runs on your local machine (or server) and forwards requests to the Kimi API, bypassing CORS restrictions.

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Browser   │ ───► │ Proxy Server│ ───► │  Kimi API   │
│  (React App)│      │ (localhost) │      │(moonshot.cn)│
└─────────────┘      └─────────────┘      └─────────────┘
```

## Setup

### 1. Install Dependencies

```bash
cd proxy-server
npm install
```

### 2. Configure Environment

```bash
# Copy the example file
copy .env.example .env

# Edit .env and verify your API credentials
```

### 3. Start the Proxy Server

```bash
# Production mode
npm start

# Development mode (auto-restart on changes)
npm run dev
```

You should see:
```
🚀 ContentHub Kimi AI Proxy Server
📡 Server running on http://localhost:3001
```

### 4. Update Frontend Configuration

Edit `app/.env`:

```env
# Change from direct API URL to proxy URL
VITE_KIMI_API_URL=http://localhost:3001/api
```

Then restart your React dev server:
```bash
cd app
npm run dev
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /api/models` | List available models |
| `POST /api/chat/completions` | Generate content |

## Testing

### Test the Proxy

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test models endpoint
curl -H "Authorization: Bearer YOUR_API_KEY" \
     http://localhost:3001/api/models
```

### Test Content Generation

```bash
curl -X POST http://localhost:3001/api/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kimi-k2.5",
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

## Production Deployment

For production, deploy this proxy server to your backend infrastructure:

1. **Vercel/Railway/Render**: Deploy as a Node.js service
2. **Docker**: Create a Dockerfile (example below)
3. **AWS/Azure/GCP**: Deploy to your cloud functions or VMs

### Docker Example

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

```bash
docker build -t contenthub-proxy .
docker run -p 3001:3001 --env-file .env contenthub-proxy
```

## Security Notes

⚠️ **Important**: This proxy exposes your API key on the server side only. Never expose your API key in the frontend code.

For production:
1. Restrict CORS to your frontend domain only
2. Add rate limiting
3. Add authentication if needed
4. Use HTTPS

## Troubleshooting

### Proxy won't start
- Check if port 3001 is already in use
- Verify your `.env` file exists and has valid credentials

### Frontend still gets CORS errors
- Make sure you updated `VITE_KIMI_API_URL` to point to the proxy
- Restart the React dev server after changing `.env`

### "API key not found" error
- Verify `KIMI_API_KEY` in `proxy-server/.env`
- Make sure the proxy server was restarted after editing `.env`
