/**
 * Embedding Service
 * Uses Moonshot embedding API (primary) or simple fallback
 */

const fetch = require('node-fetch');

// Configuration
const MOONSHOT_EMBEDDING_URL = 'https://api.moonshot.cn/v1/embeddings';
const MOONSHOT_MODEL = 'moonshot-embedding-text-1';

// State
let useMoonshot = false;
let hasMoonshot = false;

/**
 * Initialize embedding service
 * Tries Moonshot API first
 */
async function initialize() {
  const apiKey = process.env.KIMI_API_KEY;
  
  // Try Moonshot API
  if (apiKey) {
    try {
      console.log('[Embedding] Testing Moonshot embedding API...');
      const testResult = await generateMoonshotEmbeddings(['test']);
      if (testResult && testResult.length > 0) {
        console.log('[Embedding] ✅ Using Moonshot API for embeddings');
        useMoonshot = true;
        hasMoonshot = true;
        return;
      }
    } catch (error) {
      console.log('[Embedding] Moonshot embedding API not available:', error.message);
    }
  }
  
  console.log('[Embedding] ⚠️ No embedding service available');
  console.log('[Embedding] RAG features will be limited');
  useMoonshot = false;
}

/**
 * Generate embeddings using Moonshot API
 */
async function generateMoonshotEmbeddings(texts) {
  const apiKey = process.env.KIMI_API_KEY;
  
  if (!apiKey) {
    throw new Error('No API key available');
  }
  
  const response = await fetch(MOONSHOT_EMBEDDING_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MOONSHOT_MODEL,
      input: texts
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Moonshot embedding failed: ${error}`);
  }
  
  const data = await response.json();
  return data.data.map(item => item.embedding);
}

/**
 * Generate embeddings (Moonshot only)
 */
async function generateEmbeddings(texts) {
  if (!Array.isArray(texts)) {
    texts = [texts];
  }
  
  if (!useMoonshot) {
    throw new Error('No embedding service available');
  }
  
  return generateMoonshotEmbeddings(texts);
}

/**
 * Get embedding function for Chroma
 * Returns an object with 'generate' method
 */
function getEmbeddingFunction() {
  return {
    generate: async (texts) => {
      const embeddings = await generateEmbeddings(texts);
      return embeddings;
    }
  };
}

/**
 * Get current backend info
 */
function getBackendInfo() {
  return {
    hasMoonshot,
    model: MOONSHOT_MODEL
  };
}

module.exports = {
  initialize,
  generateEmbeddings,
  getEmbeddingFunction,
  getBackendInfo,
  generateMoonshotEmbeddings
};
