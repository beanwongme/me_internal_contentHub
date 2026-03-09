/**
 * ContentHub AI Proxy Server v3.0 with RAG Support
 * 
 * Features:
 * - Response caching (configurable TTL)
 * - Streaming support for real-time content generation
 * - Token usage tracking and logging
 * - Multi-provider failover
 * - RAG (Retrieval-Augmented Generation) with Chroma DB
 * - Web scraping and document parsing for vector DB
 * 
 * Setup:
 * 1. cd proxy-server
 * 2. npm install
 * 3. Configure .env with your provider
 * 4. npm start
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import services
const chromaService = require('./services/chromaService');
const textExtractionService = require('./services/textExtractionService');

const app = express();
const PORT = process.env.PORT || 3001;

// Multi-provider configuration
const PROVIDERS = {
  kimi: {
    name: 'Kimi (Moonshot)',
    baseUrl: 'https://api.moonshot.cn/v1',
    defaultModel: 'kimi-k2.5',
    requiresTemperatureOne: true,
    apiKey: process.env.KIMI_API_KEY,
    appId: process.env.KIMI_APP_ID
  },
  fireworks: {
    name: 'Fireworks AI',
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    defaultModel: 'accounts/fireworks/models/llama-v3p1-70b-instruct',
    requiresTemperatureOne: false,
    apiKey: process.env.FIREWORKS_API_KEY
  },
  deepinfra: {
    name: 'DeepInfra',
    baseUrl: 'https://api.deepinfra.com/v1/openai',
    defaultModel: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
    requiresTemperatureOne: false,
    apiKey: process.env.DEEPINFRA_API_KEY
  }
};

// Active provider selection
const ACTIVE_PROVIDER = process.env.AI_PROVIDER || 'kimi';
const provider = PROVIDERS[ACTIVE_PROVIDER];

if (!provider) {
  console.error(`❌ ERROR: Unknown provider "${ACTIVE_PROVIDER}"`);
  process.exit(1);
}

if (!provider.apiKey) {
  console.error(`❌ ERROR: API key not found for provider "${ACTIVE_PROVIDER}"`);
  process.exit(1);
}

// Cache configuration
const CACHE_TTL = (parseInt(process.env.CACHE_TTL_MINUTES) || 10) * 60 * 1000;
const MAX_CACHE_SIZE = parseInt(process.env.MAX_CACHE_SIZE) || 200;
const cache = new Map();

let cacheStats = { hits: 0, misses: 0, evictions: 0, partialHits: 0 };
let tokenUsageStats = {
  totalRequests: 0,
  totalPromptTokens: 0,
  totalCompletionTokens: 0,
  totalTokens: 0
};

// File upload configuration
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.txt', '.md', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}. Allowed: ${allowedTypes.join(', ')}`));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================
// RAG ENDPOINTS
// ============================================

/**
 * Create/Update Vector DB from URL and files
 * POST /api/rag/create-db
 * Query params:
 *   - crawl: 'true' to crawl entire website (default: false)
 *   - maxPages: max pages to crawl (default: 10)
 *   - maxDepth: max crawl depth (default: 2)
 */
app.post('/api/rag/create-db', upload.any(), async (req, res) => {
  console.log('[RAG] Creating/updating vector DB...');
  
  try {
    // Parse URL from body (handle both JSON and form-data)
    let url = req.body?.url || '';
    const files = req.files || [];
    
    // Crawl options
    const shouldCrawl = req.body?.crawl === 'true' || req.body?.crawl === true;
    const maxPages = parseInt(req.body?.maxPages) || 10;
    const maxDepth = parseInt(req.body?.maxDepth) || 2;
    
    console.log('[RAG] Request body:', req.body);
    console.log('[RAG] Files:', files.length);
    console.log('[RAG] URL:', url);
    console.log('[RAG] Crawl mode:', shouldCrawl, { maxPages, maxDepth });
    
    if (!url && files.length === 0) {
      return res.status(400).json({
        error: 'No input provided',
        message: 'Please provide a URL or upload at least one file'
      });
    }
    
    const allDocuments = [];
    const errors = [];
    const crawledUrls = [];
    
    // Process URL if provided
    if (url) {
      if (shouldCrawl) {
        // Crawl entire website
        try {
          console.log(`[RAG] Crawling website: ${url}`);
          const crawlResults = await textExtractionService.crawlWebsite(url, {
            maxPages,
            maxDepth
          });
          
          console.log(`[RAG] Website crawled: ${crawlResults.length} pages`);
          
          for (const page of crawlResults) {
            try {
              const chunks = textExtractionService.chunkText(page.text, 800, 100);
              
              chunks.forEach((chunk, i) => {
                allDocuments.push({
                  text: chunk,
                  metadata: {
                    ...page.metadata,
                    chunk_index: i,
                    total_chunks: chunks.length,
                    page_url: page.url
                  }
                });
              });
              
              crawledUrls.push(page.url);
              console.log(`[RAG] Page processed: ${page.url} (${chunks.length} chunks)`);
            } catch (pageError) {
              console.error(`[RAG] Page processing failed: ${page.url}`, pageError.message);
              errors.push({ type: 'url', source: page.url, error: pageError.message });
            }
          }
        } catch (error) {
          console.error('[RAG] Website crawl failed:', error.message);
          errors.push({ type: 'crawl', source: url, error: error.message });
        }
      } else {
        // Single page extraction
        try {
          console.log('[RAG] Processing single URL:', url);
          const urlData = await textExtractionService.extractFromUrl(url);
          const chunks = textExtractionService.chunkText(urlData.text, 800, 100);
          
          chunks.forEach((chunk, i) => {
            allDocuments.push({
              text: chunk,
              metadata: {
                ...urlData.metadata,
                chunk_index: i,
                total_chunks: chunks.length
              }
            });
          });
          
          crawledUrls.push(url);
          console.log(`[RAG] URL processed: ${chunks.length} chunks`);
        } catch (error) {
          console.error('[RAG] URL processing failed:', error.message);
          errors.push({ type: 'url', source: url, error: error.message });
        }
      }
    }
    
    // Process uploaded files
    for (const file of files) {
      try {
        console.log('[RAG] Processing file:', file.originalname);
        const fileData = await textExtractionService.extractFromFile(file.path);
        const chunks = textExtractionService.chunkText(fileData.text, 800, 100);
        
        chunks.forEach((chunk, i) => {
          allDocuments.push({
            text: chunk,
            metadata: {
              ...fileData.metadata,
              chunk_index: i,
              total_chunks: chunks.length
            }
          });
        });
        
        // Clean up uploaded file
        fs.unlinkSync(file.path);
        console.log(`[RAG] File processed: ${chunks.length} chunks`);
      } catch (error) {
        console.error('[RAG] File processing failed:', error);
        // Continue with other files
      }
    }
    
    if (allDocuments.length === 0) {
      // Provide specific error message if we have errors
      const errorMessage = errors.length > 0 
        ? errors.map(e => e.error).join('; ')
        : 'Failed to extract text from provided sources';
      
      return res.status(400).json({
        error: 'No content extracted',
        message: errorMessage,
        errors: errors
      });
    }
    
    // Add to Chroma
    const result = await chromaService.addDocuments(allDocuments);
    
    // Get updated stats
    const stats = await chromaService.getStats();
    
    res.json({
      success: true,
      message: `Vector DB updated with ${result.count} chunks`,
      stats: {
        totalDocuments: stats.count,
        newChunks: result.count,
        sources: [
          ...(shouldCrawl ? crawledUrls.map(u => ({ type: 'crawled_url', url: u })) : 
              url ? [{ type: 'url', url }] : []),
          ...(files.map(f => ({ type: 'file', name: f.originalname })))
        ],
        crawlInfo: shouldCrawl ? {
          pagesCrawled: crawledUrls.length,
          maxPages,
          maxDepth
        } : undefined
      },
      warnings: errors.length > 0 ? errors : undefined
    });
    
    console.log('[RAG] Vector DB update complete:', result.count, 'chunks added');
    
  } catch (error) {
    console.error('[RAG] Failed to create vector DB:', error);
    res.status(500).json({
      error: 'Failed to create vector DB',
      message: error.message
    });
  }
});

/**
 * Query Vector DB (for testing)
 * POST /api/rag/query
 */
app.post('/api/rag/query', async (req, res) => {
  try {
    const { query, nResults = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    
    const contexts = await chromaService.queryContext(query, nResults);
    
    res.json({
      success: true,
      query,
      results: contexts || []
    });
  } catch (error) {
    console.error('[RAG] Query failed:', error);
    res.status(500).json({
      error: 'Query failed',
      message: error.message
    });
  }
});

/**
 * Get Vector DB Stats
 * GET /api/rag/stats
 */
app.get('/api/rag/stats', async (req, res) => {
  try {
    const stats = await chromaService.getStats();
    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get stats',
      message: error.message
    });
  }
});

/**
 * Clear Vector DB
 * POST /api/rag/clear
 */
app.post('/api/rag/clear', async (req, res) => {
  try {
    await chromaService.clearCollection();
    res.json({
      success: true,
      message: 'Vector DB cleared'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to clear DB',
      message: error.message
    });
  }
});

/**
 * Test Chroma Cloud Connection
 * GET /api/rag/test-cloud
 */
app.get('/api/rag/test-cloud', async (req, res) => {
  try {
    const result = await chromaService.testCloudConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Test failed',
      message: error.message
    });
  }
});

// ============================================
// EXISTING ENDPOINTS
// ============================================

// Health check with RAG stats
app.get('/health', async (req, res) => {
  const connectionStatus = await testProviderConnection();
  const ragStats = await chromaService.getStats();
  
  res.json({ 
    status: connectionStatus.connected ? 'ok' : 'degraded', 
    service: 'ContentHub AI Proxy',
    provider: {
      name: provider.name,
      baseUrl: provider.baseUrl,
      model: provider.defaultModel,
      connection: connectionStatus
    },
    rag: {
      initialized: ragStats.initialized,
      documentCount: ragStats.count
    },
    cache: {
      size: cache.size,
      hits: cacheStats.hits,
      misses: cacheStats.misses,
      hitRate: ((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100 || 0).toFixed(1) + '%'
    },
    timestamp: new Date().toISOString()
  });
});

// Test connection to AI provider
async function testProviderConnection() {
  try {
    const headers = {
      'Authorization': `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json'
    };
    
    if (provider.appId) {
      headers['X-App-ID'] = provider.appId;
    }
    
    const response = await fetch(`${provider.baseUrl}/models`, {
      method: 'GET',
      headers,
      timeout: 10000
    });
    
    if (response.ok) {
      return { connected: true, models: 0 };
    } else {
      return { connected: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

// Modified chat completions with RAG support
app.post('/api/*', async (req, res) => {
  const targetPath = req.params[0];
  const targetUrl = `${provider.baseUrl}/${targetPath}`;
  
  // Adjust temperature for Kimi
  if (provider.requiresTemperatureOne && req.body.temperature !== 1) {
    req.body.temperature = 1;
  }
  
  const isStreaming = req.body.stream === true;
  
  // Extract user message for RAG query
  const userMessage = req.body.messages?.find(m => m.role === 'user')?.content || '';
  
  // RAG Enhancement: Query vector DB and inject context
  if (userMessage && targetPath === 'chat/completions') {
    try {
      console.log('[RAG] Querying vector DB for context...');
      const contexts = await chromaService.queryContext(userMessage, 5);
      
      if (contexts && contexts.length > 0) {
        // Create RAG-enhanced system prompt
        const contextText = contexts.map((ctx, i) => 
          `[${i + 1}] ${ctx.text.substring(0, 150)}`
        ).join('\n\n');
        
        const ragPrompt = `Company context (use if relevant, else use general knowledge):\n${contextText}`;
        
        // Find and update system message, or add new one
        const systemMsgIndex = req.body.messages.findIndex(m => m.role === 'system');
        if (systemMsgIndex >= 0) {
          req.body.messages[systemMsgIndex].content = ragPrompt + '\n\n' + req.body.messages[systemMsgIndex].content;
        } else {
          req.body.messages.unshift({ role: 'system', content: ragPrompt });
        }
        
        console.log(`[RAG] Injected ${contexts.length} context documents`);
      }
    } catch (error) {
      console.log('[RAG] Failed to query context, continuing without RAG:', error.message);
    }
  }
  
  // Check cache for non-streaming
  if (!isStreaming) {
    const cacheKey = JSON.stringify({ path: req.path, body: req.body });
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      cacheStats.hits++;
      return res.json(cached.data);
    }
    cacheStats.misses++;
  }
  
  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': isStreaming ? 'text/event-stream' : 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    // Handle errors
    if (!response.ok) {
      const errorBody = await response.text();
      return res.status(response.status).json({
        error: 'Kimi API error',
        status: response.status,
        details: errorBody
      });
    }
    
    // Stream response
    if (isStreaming && response.ok) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      response.body.pipe(res);
      return;
    }
    
    // Non-streaming: cache and return
    const data = await response.json();
    
    if (response.ok && data.choices) {
      if (cache.size >= MAX_CACHE_SIZE) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
        cacheStats.evictions++;
      }
      const cacheKey = JSON.stringify({ path: req.path, body: req.body });
      cache.set(cacheKey, { data, timestamp: Date.now() });
    }
    
    res.json(data);
  } catch (error) {
    console.error('[Proxy Error]', error);
    res.status(500).json({ 
      error: 'Proxy request failed',
      message: error.message 
    });
  }
});

// GET handler for /api/* - forwards GET requests to Kimi API
app.get('/api/*', async (req, res) => {
  const targetPath = req.params[0];
  const targetUrl = `${provider.baseUrl}/${targetPath}`;
  
  console.log(`[Proxy GET] ${targetPath} → ${targetUrl}`);
  
  try {
    const headers = {
      'Authorization': `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json'
    };
    
    if (provider.appId) {
      headers['X-App-ID'] = provider.appId;
    }
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[Proxy GET] Error ${response.status}:`, errorBody);
      return res.status(response.status).json({
        error: 'Kimi API error',
        status: response.status,
        details: errorBody
      });
    }
    
    const data = await response.json();
    res.json(data);
    
    console.log(`[Proxy GET] Success: ${targetPath}`);
  } catch (error) {
    console.error('[Proxy GET Error]', error);
    res.status(500).json({ 
      error: 'Proxy GET request failed',
      message: error.message 
    });
  }
});

// Test connection endpoint
app.get('/test/kimi-connection', async (req, res) => {
  try {
    const testBody = {
      model: provider.defaultModel,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "Kimi connection successful"' }
      ],
      max_tokens: 20,
      temperature: provider.requiresTemperatureOne ? 1 : 0.7
    };
    
    const response = await fetch(`${provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testBody)
    });
    
    if (response.ok) {
      const data = await response.json();
      res.json({
        success: true,
        provider: provider.name,
        model: provider.defaultModel,
        response: data.choices?.[0]?.message?.content
      });
    } else {
      res.status(502).json({
        success: false,
        error: `HTTP ${response.status}`
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize and start server
async function startServer() {
  // Initialize Chroma
  console.log('[Server] Initializing Chroma vector DB...');
  const chromaInitialized = await chromaService.initializeChroma();
  
  if (chromaInitialized) {
    console.log('✅ Chroma vector DB initialized');
  } else {
    console.log('⚠️ Chroma initialization failed, RAG features may be unavailable');
  }
  
  app.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 ContentHub AI Proxy Server v3.0');
    console.log('========================================');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`🔗 Provider: ${provider.name}`);
    console.log(`🤖 Model: ${provider.defaultModel}`);
    console.log(`🧠 RAG: ${chromaInitialized ? 'Enabled' : 'Disabled'}`);
    console.log('');
    console.log('📋 Available endpoints:');
    console.log(`   - Health:          http://localhost:${PORT}/health`);
    console.log(`   - Test Connection: http://localhost:${PORT}/test/kimi-connection`);
    console.log(`   - Chat:            http://localhost:${PORT}/api/chat/completions`);
    console.log('');
    console.log('🆕 RAG Endpoints:');
    console.log(`   - Create DB:       POST http://localhost:${PORT}/api/rag/create-db`);
    console.log(`   - Query DB:        POST http://localhost:${PORT}/api/rag/query`);
    console.log(`   - DB Stats:        GET  http://localhost:${PORT}/api/rag/stats`);
    console.log(`   - Clear DB:        POST http://localhost:${PORT}/api/rag/clear`);
    console.log('========================================');
  });
}

startServer();
