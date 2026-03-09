/**
 * Chroma Cloud Service
 * Connects to Chroma Cloud (api.trychroma.com)
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Chroma Cloud Configuration
const CHROMA_HOST = process.env.CHROMA_HOST || 'api.trychroma.com';
const CHROMA_API_KEY = process.env.CHROMA_API_KEY || 'ck-5DisXFprdonMUGe6at2QinmwatttpEw6TBfbVwPPH8EV';
const CHROMA_TENANT = process.env.CHROMA_TENANT || 'a56f174a-61e7-4f6c-aa55-f6a22659db9d';
const CHROMA_DATABASE = process.env.CHROMA_DATABASE || 'contentHub';
const COLLECTION_NAME = 'company_info';

const BASE_URL = `https://${CHROMA_HOST}`;

// Collection ID cache
let collectionId = null;
let useCloud = false;

// Auth header - use x-chroma-token for Chroma Cloud
const AUTH_HEADER = { 'x-chroma-token': CHROMA_API_KEY, 'Content-Type': 'application/json' };

// Local backup
const BACKUP_FILE = path.join(__dirname, '..', 'chroma_db', 'backup.json');

// Better word-based embedding function (fallback when Moonshot not available)
function generateWordEmbedding(text, dim = 384) {
  const embedding = new Array(dim).fill(0);
  
  // Tokenize: extract words (2+ chars, alphanumeric)
  const words = text.toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s]/g, ' ')  // Keep alphanumeric and Chinese
    .split(/\s+/)
    .filter(w => w.length >= 2);
  
  // Common stop words to de-emphasize
  const stopWords = new Set(['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'who', 'boy', 'did', 'she', 'use', 'her', 'way', 'many', 'oil', 'sit', 'set', 'run', 'eat', 'far', 'sea', 'eye', 'ask', 'own', 'say', 'too', 'any', 'try', 'let', 'put', 'end', 'why', 'turn', 'here', 'show', 'every', 'good', 'me', 'too', 'back', 'after', 'first', 'well', 'year', 'work', 'where', 'much', 'before', 'right', 'too', 'means', 'old', 'any', 'same', 'tell', 'very', 'when', 'come', 'also', 'back', 'work', 'only', 'three', 'around', 'another', 'came', 'come', 'work', 'three', 'must', 'because', 'does', 'part', 'even', 'place', 'made', 'live', 'where', 'after', 'back', 'little', 'only', 'round', 'man', 'year', 'came', 'every', 'good', 'me', 'give', 'our', 'under', 'name', 'very', 'through', 'just', 'form', 'sentence', 'great', 'think', 'say', 'help', 'low', 'line', 'differ', 'turn', 'cause', 'much', 'mean', 'before', 'move', 'right', 'boy', 'old', 'too', 'same']);
  
  // Generate word-based hash with TF (term frequency) weighting
  const wordFreq = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });
  
  Object.entries(wordFreq).forEach(([word, freq]) => {
    // Simple hash function for word
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    const idx = Math.abs(hash) % dim;
    
    // Weight by frequency and penalize stop words
    const weight = stopWords.has(word) ? 0.3 : 1.0;
    embedding[idx] += (freq * weight) / words.length;
  });
  
  // Add bigram features (pairs of consecutive words) for better context
  for (let i = 0; i < words.length - 1; i++) {
    const bigram = words[i] + '_' + words[i + 1];
    let hash = 0;
    for (let j = 0; j < bigram.length; j++) {
      hash = ((hash << 5) - hash) + bigram.charCodeAt(j);
      hash = hash & hash;
    }
    const idx = Math.abs(hash) % dim;
    embedding[idx] += 0.5 / words.length; // Lower weight for bigrams
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    return embedding.map(val => val / magnitude);
  }
  return embedding;
}

function generateSimpleEmbeddings(texts, dim = 384) {
  return texts.map(text => generateWordEmbedding(text, dim));
}

/**
 * Initialize Chroma Cloud connection
 */
async function initializeChroma() {
  console.log('[Chroma] Initializing...');
  console.log(`[Chroma] Host: ${CHROMA_HOST}`);
  console.log(`[Chroma] Tenant: ${CHROMA_TENANT}`);
  console.log(`[Chroma] Database: ${CHROMA_DATABASE}`);
  
  try {
    // Test connection by listing collections
    const response = await fetch(
      `${BASE_URL}/api/v2/tenants/${CHROMA_TENANT}/databases/${CHROMA_DATABASE}/collections`,
      {
        headers: AUTH_HEADER
      }
    );
    
    if (response.ok) {
      const collections = await response.json();
      console.log(`[Chroma] ✅ Connected to Chroma Cloud`);
      console.log(`[Chroma] Found ${collections.length} collections`);
      
      // Find existing collection
      const existing = collections.find(c => c.name === COLLECTION_NAME);
      if (existing) {
        collectionId = existing.id;
        console.log(`[Chroma] Using existing collection: ${collectionId}`);
        useCloud = true;
      } else {
        // Try to create collection, but don't fail if permission denied
        console.log(`[Chroma] Collection '${COLLECTION_NAME}' not found, will create on first use`);
        useCloud = true;  // Still use cloud, will create collection when adding docs
      }
      
      return true;
    } else {
      const error = await response.text();
      console.error('[Chroma] Connection failed:', error);
      console.log('[Chroma] Falling back to local storage');
      return initializeLocal();
    }
  } catch (error) {
    console.error('[Chroma] Initialization error:', error.message);
    console.log('[Chroma] Falling back to local storage');
    return initializeLocal();
  }
}

/**
 * Create collection in Chroma Cloud
 */
async function createCollection() {
  const response = await fetch(
    `${BASE_URL}/api/v2/tenants/${CHROMA_TENANT}/databases/${CHROMA_DATABASE}/collections`,
    {
      method: 'POST',
      headers: AUTH_HEADER,
      body: JSON.stringify({
        name: COLLECTION_NAME,
        metadata: { description: 'Company information for RAG' }
      })
    }
  );
  
  if (response.ok) {
    const collection = await response.json();
    collectionId = collection.id;
    console.log(`[Chroma] Created new collection: ${collectionId}`);
  } else {
    throw new Error('Failed to create collection: ' + await response.text());
  }
}

/**
 * Initialize local fallback
 */
async function initializeLocal() {
  useCloud = false;
  const dbDir = path.dirname(BACKUP_FILE);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  const data = getLocalData();
  console.log(`[Chroma] Local storage ready with ${data.documents?.length || 0} documents`);
  return true;
}

/**
 * Get local data
 */
function getLocalData() {
  if (fs.existsSync(BACKUP_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf-8'));
    } catch (e) {
      return { documents: [], metadatas: [], ids: [] };
    }
  }
  return { documents: [], metadatas: [], ids: [] };
}

/**
 * Save local data
 */
function saveLocalData(data) {
  try {
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('[Chroma] Save failed:', error);
  }
}

/**
 * Add documents
 */
async function addDocuments(docs) {
  if (!docs || docs.length === 0) {
    throw new Error('No documents provided');
  }

  // Lazy collection creation for Chroma Cloud
  if (useCloud && !collectionId) {
    try {
      await createCollection();
    } catch (error) {
      console.error('[Chroma] Failed to create collection:', error.message);
      console.log('[Chroma] Falling back to local storage');
      useCloud = false;
    }
  }

  const ids = docs.map((_, i) => `doc_${Date.now()}_${i}`);
  const texts = docs.map(d => d.text);
  const metadatas = docs.map(d => ({
    source: d.metadata?.source || 'unknown',
    type: d.metadata?.type || 'text',
    chunk_index: d.metadata?.chunk_index || 0,
    total_chunks: d.metadata?.total_chunks || 1,
    timestamp: new Date().toISOString()
  }));

  // Generate embeddings
  let embeddings;
  try {
    // Try to use embedding service if available
    const embeddingService = require('./embeddingService');
    embeddings = await embeddingService.generateEmbeddings(texts);
    console.log('[Chroma] Using Moonshot embeddings');
  } catch (error) {
    // Fallback to simple embeddings
    console.log('[Chroma] Using simple hash embeddings (Moonshot unavailable)');
    embeddings = generateSimpleEmbeddings(texts, 384);
  }

  if (useCloud && collectionId) {
    try {
      const response = await fetch(
        `${BASE_URL}/api/v2/tenants/${CHROMA_TENANT}/databases/${CHROMA_DATABASE}/collections/${collectionId}/add`,
        {
          method: 'POST',
          headers: AUTH_HEADER,
          body: JSON.stringify({
            ids,
            documents: texts,
            metadatas,
            embeddings
          })
        }
      );
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      console.log(`[Chroma] Added ${docs.length} documents to Chroma Cloud`);
      
      // Also backup locally
      const existing = getLocalData();
      saveLocalData({
        ids: [...existing.ids, ...ids],
        documents: [...existing.documents, ...texts],
        metadatas: [...existing.metadatas, ...metadatas]
      });
      
      return { success: true, count: docs.length };
    } catch (error) {
      console.error('[Chroma] Cloud add failed:', error.message);
      throw error;
    }
  } else {
    // Local fallback
    const existing = getLocalData();
    saveLocalData({
      ids: [...existing.ids, ...ids],
      documents: [...existing.documents, ...texts],
      metadatas: [...existing.metadatas, ...metadatas]
    });
    console.log(`[Chroma] Added ${docs.length} documents to local storage`);
    return { success: true, count: docs.length };
  }
}

/**
 * Query documents
 */
async function queryContext(query, nResults = 5) {
  if (useCloud && collectionId) {
    try {
      // Generate query embedding
      let queryEmbedding;
      try {
        const embeddingService = require('./embeddingService');
        const embeddings = await embeddingService.generateEmbeddings([query]);
        queryEmbedding = embeddings[0];
      } catch (error) {
        queryEmbedding = generateWordEmbedding(query, 384);
      }
      
      const response = await fetch(
        `${BASE_URL}/api/v2/tenants/${CHROMA_TENANT}/databases/${CHROMA_DATABASE}/collections/${collectionId}/query`,
        {
          method: 'POST',
          headers: AUTH_HEADER,
          body: JSON.stringify({
            query_embeddings: [queryEmbedding],
            n_results: nResults
          })
        }
      );
      
      if (!response.ok) {
        throw new Error('Query failed');
      }
      
      const result = await response.json();
      
      if (!result.documents?.[0] || result.documents[0].length === 0) {
        console.log('[Chroma] No relevant documents found');
        return null;
      }
      
      let contexts = result.documents[0].map((text, i) => ({
        text,
        metadata: result.metadatas[0][i],
        distance: result.distances?.[0]?.[i] || 0
      }));
      
      // If distances are poor (all > 1.0), supplement with keyword search
      const avgDistance = contexts.reduce((sum, c) => sum + c.distance, 0) / contexts.length;
      if (avgDistance > 0.9) {
        console.log('[Chroma] Vector similarity low, supplementing with keyword search...');
        const keywordResults = await queryCloudKeywords(query, nResults);
        if (keywordResults && keywordResults.length > 0) {
          // Merge and deduplicate
          const seen = new Set(contexts.map(c => c.text));
          for (const kr of keywordResults) {
            if (!seen.has(kr.text)) {
              contexts.push(kr);
              seen.add(kr.text);
            }
          }
          // Re-sort by hybrid score
          contexts = rankByHybridScore(contexts, query);
        }
      }
      
      console.log(`[Chroma] Found ${contexts.length} documents from Chroma Cloud`);
      return contexts.slice(0, nResults);
    } catch (error) {
      console.error('[Chroma] Query error:', error.message);
      return null;
    }
  } else {
    // Local query with keyword matching
    return queryLocal(query, nResults);
  }
}

/**
 * Query local storage
 */
function queryLocal(query, nResults) {
  const data = getLocalData();
  
  if (!data.documents || data.documents.length === 0) {
    return null;
  }
  
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  const scores = data.documents.map((doc, i) => {
    const docLower = doc.toLowerCase();
    let matches = 0;
    for (const word of queryWords) {
      if (docLower.includes(word)) matches++;
    }
    return { index: i, score: queryWords.length > 0 ? matches / queryWords.length : 0 };
  });
  
  scores.sort((a, b) => b.score - a.score);
  const top = scores.slice(0, nResults).filter(s => s.score > 0);
  
  if (top.length === 0) return null;
  
  return top.map(t => ({
    text: data.documents[t.index],
    metadata: data.metadatas[t.index],
    distance: 1 - t.score
  }));
}

/**
 * Query Chroma Cloud using keyword matching (fallback)
 */
async function queryCloudKeywords(query, nResults) {
  try {
    // Get all documents from collection
    const response = await fetch(
      `${BASE_URL}/api/v2/tenants/${CHROMA_TENANT}/databases/${CHROMA_DATABASE}/collections/${collectionId}/get`,
      {
        method: 'POST',
        headers: AUTH_HEADER,
        body: JSON.stringify({ limit: 1000 })
      }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.documents || data.documents.length === 0) return null;
    
    // Keyword matching
    const queryWords = query.toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length >= 2);
    
    const scored = data.documents.map((doc, i) => {
      const docLower = doc.toLowerCase();
      let score = 0;
      
      for (const word of queryWords) {
        // Exact word match
        const regex = new RegExp(`\\b${word}\\b`, 'g');
        const matches = (docLower.match(regex) || []).length;
        score += matches * 2; // Weight exact matches higher
        
        // Partial match
        if (docLower.includes(word)) {
          score += 1;
        }
      }
      
      // Normalize by document length
      score = score / (docLower.split(/\s+/).length + 1);
      
      return {
        text: doc,
        metadata: data.metadatas[i],
        distance: 1 - Math.min(score, 1),
        keywordScore: score
      };
    });
    
    scored.sort((a, b) => b.keywordScore - a.keywordScore);
    return scored.slice(0, nResults).filter(s => s.keywordScore > 0);
  } catch (error) {
    console.error('[Chroma] Keyword query error:', error.message);
    return null;
  }
}

/**
 * Rank documents by hybrid score (vector distance + keyword match)
 */
function rankByHybridScore(documents, query) {
  const queryWords = query.toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2);
  
  return documents.map(doc => {
    // Calculate keyword score
    const docLower = doc.text.toLowerCase();
    let keywordScore = 0;
    
    for (const word of queryWords) {
      if (docLower.includes(word)) keywordScore += 1;
    }
    keywordScore = queryWords.length > 0 ? keywordScore / queryWords.length : 0;
    
    // Normalize vector distance to 0-1 score (lower distance = higher score)
    const vectorScore = Math.max(0, 1 - doc.distance);
    
    // Hybrid score: 60% vector + 40% keyword
    const hybridScore = (vectorScore * 0.6) + (keywordScore * 0.4);
    
    return {
      ...doc,
      hybridScore,
      distance: 1 - hybridScore  // Convert back to distance for consistency
    };
  }).sort((a, b) => b.hybridScore - a.hybridScore);
}

/**
 * Clear collection
 */
async function clearCollection() {
  if (useCloud && collectionId) {
    try {
      // Delete in batches due to quota limits (300 per request)
      let deleted = 0;
      let hasMore = true;
      
      while (hasMore) {
        // Get batch of IDs
        const getResp = await fetch(
          `${BASE_URL}/api/v2/tenants/${CHROMA_TENANT}/databases/${CHROMA_DATABASE}/collections/${collectionId}/get`,
          {
            method: 'POST',
            headers: AUTH_HEADER,
            body: JSON.stringify({ limit: 300 })
          }
        );
        
        if (getResp.ok) {
          const data = await getResp.json();
          if (data.ids && data.ids.length > 0) {
            // Delete this batch
            const delResp = await fetch(
              `${BASE_URL}/api/v2/tenants/${CHROMA_TENANT}/databases/${CHROMA_DATABASE}/collections/${collectionId}/delete`,
              {
                method: 'POST',
                headers: AUTH_HEADER,
                body: JSON.stringify({ ids: data.ids })
              }
            );
            
            if (delResp.ok) {
              deleted += data.ids.length;
              console.log(`[Chroma] Deleted batch of ${data.ids.length} documents`);
            }
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }
      
      console.log(`[Chroma] Total deleted: ${deleted} documents`);
    } catch (error) {
      console.error('[Chroma] Clear error:', error);
    }
  }
  
  // Clear local backup
  if (fs.existsSync(BACKUP_FILE)) {
    fs.unlinkSync(BACKUP_FILE);
  }
  
  console.log('[Chroma] Collection cleared');
  return { success: true };
}

/**
 * Get stats
 */
async function getStats() {
  try {
    if (useCloud) {
      if (collectionId) {
        const response = await fetch(
          `${BASE_URL}/api/v2/tenants/${CHROMA_TENANT}/databases/${CHROMA_DATABASE}/collections/${collectionId}/count`,
          {
            headers: { 'x-chroma-token': CHROMA_API_KEY }
          }
        );
        
        if (response.ok) {
          const count = await response.json();
          return { initialized: true, count, useCloud: true, name: COLLECTION_NAME };
        }
      }
      // Connected but no collection yet
      return { initialized: true, count: 0, useCloud: true, name: COLLECTION_NAME, status: 'connected_no_collection' };
    }
    
    const local = getLocalData();
    return { initialized: true, count: local.documents?.length || 0, useCloud: false };
  } catch (error) {
    return { initialized: false, count: 0, error: error.message };
  }
}

/**
 * Test Chroma Cloud connection and permissions
 */
async function testCloudConnection() {
  const results = {
    config: {
      host: CHROMA_HOST,
      tenant: CHROMA_TENANT,
      database: CHROMA_DATABASE,
      collection: COLLECTION_NAME,
      apiKeyPrefix: CHROMA_API_KEY ? CHROMA_API_KEY.substring(0, 10) + '...' : 'not set'
    },
    tests: {}
  };
  
  try {
    // Test 1: List collections
    const listResponse = await fetch(
      `${BASE_URL}/api/v2/tenants/${CHROMA_TENANT}/databases/${CHROMA_DATABASE}/collections`,
      { headers: AUTH_HEADER }
    );
    results.tests.listCollections = {
      success: listResponse.ok,
      status: listResponse.status,
      data: listResponse.ok ? await listResponse.json() : await listResponse.text()
    };
    
    // Test 2: Try to create a collection
    const createResponse = await fetch(
      `${BASE_URL}/api/v2/tenants/${CHROMA_TENANT}/databases/${CHROMA_DATABASE}/collections`,
      {
        method: 'POST',
        headers: AUTH_HEADER,
        body: JSON.stringify({
          name: `test_collection_${Date.now()}`,
          metadata: { test: true }
        })
      }
    );
    results.tests.createCollection = {
      success: createResponse.ok,
      status: createResponse.status,
      data: createResponse.ok ? await createResponse.json() : await createResponse.text()
    };
    
    // Test 3: Check if tenant exists
    const tenantResponse = await fetch(
      `${BASE_URL}/api/v2/tenants/${CHROMA_TENANT}`,
      { headers: AUTH_HEADER }
    );
    results.tests.getTenant = {
      success: tenantResponse.ok,
      status: tenantResponse.status,
      data: tenantResponse.ok ? await tenantResponse.json() : await tenantResponse.text()
    };
    
    return { success: true, results };
  } catch (error) {
    return { success: false, error: error.message, results };
  }
}

module.exports = {
  initializeChroma,
  addDocuments,
  queryContext,
  clearCollection,
  getStats,
  testCloudConnection
};
