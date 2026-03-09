# ContentHub RAG (Retrieval-Augmented Generation) Setup

This guide explains how to set up and use the Chroma vector database for RAG-based content generation.

## What is RAG?

RAG (Retrieval-Augmented Generation) enhances AI content generation by:
1. Storing your company information in a vector database
2. Retrieving relevant context when generating content
3. Injecting that context into the AI prompt for accurate, company-specific output

## Architecture

```
User Input (Topic/Objective)
    ↓
[Query Vector DB] → Find relevant company info
    ↓
[Inject Context] → "Use ONLY this company info: [docs]"
    ↓
[Send to Kimi AI] → Generate content with context
    ↓
Company-specific content output
```

## Quick Start

### 1. Install Dependencies

```bash
cd proxy-server
npm install chromadb cheerio pdf-parse multer
```

### 2. Start the Server

```bash
npm start
```

The server will automatically:
- Initialize Chroma vector DB in `./chroma_db`
- Set up embedding service (Moonshot API or local fallback)

### 3. Add Company Information

#### Option A: Via Test Page (Recommended)
1. Go to: http://localhost:5173/test/kimi
2. Scroll to **"RAG Vector Database"** section
3. Enter a website URL (e.g., `https://yourcompany.com/about`)
4. Or upload files (PDF, TXT, MD)
5. Click **"Create/Update Vector DB"**

#### Option B: Via API
```bash
curl -X POST http://localhost:3001/api/rag/create-db \
  -F "url=https://yourcompany.com/about" \
  -F "files=@document.pdf"
```

### 4. Generate Content with RAG

1. Go to Content Studio: http://localhost:5173/social-content/studio
2. Check the **"Use RAG"** checkbox (appears when DB has documents)
3. Enter topic and objective
4. Click **"Generate Content"**
5. The AI will use your company knowledge base!

## Features

### Supported Data Sources

| Source | Format | Notes |
|--------|--------|-------|
| Website URLs | HTML | Auto-extracts main content |
| PDF Files | .pdf | Full text extraction |
| Text Files | .txt, .md | Direct text |
| JSON Files | .json | For structured data |

### Text Processing

- **Chunking**: Documents split into ~800 char chunks with 100 char overlap
- **Embedding**: Uses Moonshot embedding API or local `all-MiniLM-L6-v2`
- **Metadata**: Stores source URL/filename, chunk index, timestamp
- **Persistence**: Data stored in `./chroma_db` directory

### RAG in Content Generation

When RAG is enabled:
1. System queries vector DB with the user's prompt
2. Retrieves top 5 most relevant document chunks
3. Injects them into system prompt:
   ```
   Use ONLY the following company information to answer:
   
   [Document 1] ...
   [Document 2] ...
   ...
   
   Based on the above information, answer the user's question accurately.
   Never invent details not present in this context.
   ```

## API Endpoints

### Create/Update Vector DB
```http
POST /api/rag/create-db
Content-Type: multipart/form-data

Form Fields:
- url: (optional) Website URL to scrape
- files: (optional) Array of files to upload

Response:
{
  "success": true,
  "message": "Vector DB updated with 12 chunks",
  "stats": {
    "totalDocuments": 12,
    "newChunks": 12,
    "sources": [...]
  }
}
```

### Query Vector DB
```http
POST /api/rag/query
Content-Type: application/json

{
  "query": "What is our company mission?",
  "nResults": 5
}

Response:
{
  "success": true,
  "query": "What is our company mission?",
  "results": [
    {
      "text": "Our mission is to...",
      "metadata": { "source": "about.html", "type": "url" },
      "distance": 0.23
    }
  ]
}
```

### Get Stats
```http
GET /api/rag/stats

Response:
{
  "success": true,
  "initialized": true,
  "count": 12,
  "name": "company_info"
}
```

### Clear Vector DB
```http
POST /api/rag/clear

Response:
{
  "success": true,
  "message": "Vector DB cleared"
}
```

## Testing

### Test via UI

1. **Go to Test Page**: http://localhost:5173/test/kimi
2. **RAG Section**: Add URL or upload files
3. **Click "Create/Update Vector DB"**
4. **Test Query**: Enter a question, click "Query DB"
5. **Generate Content**: Use simple generator with RAG enabled

### Test via cURL

```bash
# 1. Create Vector DB
curl -X POST http://localhost:3001/api/rag/create-db \
  -F "url=https://en.wikipedia.org/wiki/Artificial_intelligence"

# 2. Check stats
curl http://localhost:3001/api/rag/stats

# 3. Query
curl -X POST http://localhost:3001/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is AI?"}'

# 4. Generate content with RAG
curl -X POST http://localhost:3001/api/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kimi-k2.5",
    "messages": [
      {"role": "user", "content": "Write a LinkedIn post about AI"}
    ],
    "stream": false
  }'
```

## Troubleshooting

### Vector DB Not Initializing

**Problem**: Server shows "⚠️ Chroma initialization failed"

**Solutions**:
1. Check if `chroma_db` directory was created
2. Restart the server: `Ctrl+C`, then `npm start`
3. Check console for embedding service errors

### No Documents Found

**Problem**: RAG shows "0 docs" or query returns empty

**Solutions**:
1. Make sure to add documents first via test page
2. Check `/api/rag/stats` endpoint
3. Try clearing and re-adding: POST `/api/rag/clear`

### Content Not Using Company Info

**Problem**: Generated content doesn't reference uploaded documents

**Solutions**:
1. Check that "Use RAG" checkbox is enabled
2. Verify documents are relevant to the topic
3. Check console logs for "[RAG] Injected X context documents"
4. Try more specific topic/objective that matches document content

### File Upload Fails

**Problem**: "Unsupported file type" or upload error

**Solutions**:
- Supported formats: `.pdf`, `.txt`, `.md`, `.json`
- Max file size: 50MB
- Check file isn't corrupted

### Slow Generation with RAG

**Problem**: Content generation is slower when RAG enabled

**Cause**: Extra query to vector DB + larger prompt

**Solutions**:
- Disable RAG for quick drafts
- Reduce number of retrieved chunks (edit server.js)
- Use smaller documents

## Configuration

### Environment Variables

```bash
# proxy-server/.env
AI_PROVIDER=kimi
KIMI_API_KEY=your-api-key
KIMI_APP_ID=your-app-id

# Optional: Adjust cache
CACHE_TTL_MINUTES=10
MAX_CACHE_SIZE=200
```

### Embedding Backend

Uses **Moonshot Embedding API** (`moonshot-embedding-text-1` model).

Requires valid `KIMI_API_KEY` in environment. If API is unavailable, RAG features will be disabled.

## File Structure

```
proxy-server/
├── server.js              # Main server with RAG endpoints
├── services/
│   ├── chromaService.js   # Chroma DB operations
│   ├── embeddingService.js # Embedding generation
│   └── textExtractionService.js # URL/file parsing
├── chroma_db/             # Vector database (auto-created)
├── uploads/               # Temporary file uploads
└── .env                   # Configuration
```

## Advanced Usage

### Custom Chunking

Edit `textExtractionService.js`:
```javascript
const chunks = chunkText(text, 1000, 200); // 1000 chars, 200 overlap
```

### Adjust Retrieved Chunks

Edit `server.js` line ~135:
```javascript
const contexts = await chromaService.queryContext(userMessage, 10); // Top 10
```

### Custom RAG Prompt

Edit `server.js` line ~141:
```javascript
const ragPrompt = `Your custom prompt here:\n\n${contextText}`;
```

## Summary

| Feature | Status |
|---------|--------|
| Chroma Vector DB | ✅ Implemented |
| Web Scraping | ✅ cheerio |
| PDF Parsing | ✅ pdf-parse |
| File Upload | ✅ multer |
| Moonshot Embeddings | ✅ Implemented |
| Text Chunking | ✅ 800 chars |
| RAG Integration | ✅ Auto-inject |
| UI Controls | ✅ Test page + Studio |

## Next Steps

1. ✅ Install dependencies
2. ✅ Start proxy server
3. ✅ Add company documents via test page
4. ✅ Generate content with RAG enabled
5. 🎉 Enjoy company-specific AI content!

---

**Need Help?** Check the debug logs in the test page or browser console for detailed error messages.
