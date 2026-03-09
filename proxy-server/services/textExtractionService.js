/**
 * Text Extraction Service
 * Extracts text from URLs (web scraping) and documents (PDFs)
 */

const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Create HTTPS agent that allows self-signed certificates (for dev/testing)
const insecureAgent = new https.Agent({
  rejectUnauthorized: false
});

/**
 * Fetch with insecure HTTPS (bypasses SSL certificate validation)
 * @param {string} url - URL to fetch
 * @returns {Promise<string>} - HTML content
 */
function fetchInsecure(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) {
      return reject(new Error('Too many redirects'));
    }
    
    const client = url.startsWith('https:') ? https : require('http');
    const options = {
      rejectUnauthorized: false,  // Skip SSL verification
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    
    client.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Resolve relative URLs
        const redirectUrl = new URL(res.headers.location, url).toString();
        console.log(`[TextExtraction] Following redirect: ${redirectUrl}`);
        return fetchInsecure(redirectUrl, maxRedirects - 1).then(resolve).catch(reject);
      }
      
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Extract text from URL (web scraping)
 * @param {string} url - Website URL
 */
async function extractFromUrl(url) {
  let html;
  let usedInsecure = false;
  
  try {
    console.log('[TextExtraction] Scraping URL:', url);
    
    // Try normal fetch first
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      html = await response.text();
    } catch (fetchError) {
      // If SSL error, retry with insecure mode
      const causeMessage = fetchError.cause?.message || '';
      const isSSLError = fetchError.message?.includes('certificate') || 
                         fetchError.message?.includes('UNABLE_TO_VERIFY') ||
                         causeMessage.includes('certificate') ||
                         causeMessage.includes('self-signed') ||
                         fetchError.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE';
      
      if (isSSLError) {
        console.log('[TextExtraction] SSL certificate error, retrying with insecure mode...');
        try {
          html = await fetchInsecure(url);
          usedInsecure = true;
        } catch (insecureError) {
          throw new Error(`SSL certificate error: ${insecureError.message}`);
        }
      } else {
        throw fetchError;
      }
    }
    
    // Check if we got meaningful content
    if (!html || html.length < 100) {
      throw new Error('Website returned empty or minimal content');
    }
    
    const $ = cheerio.load(html);
    
    // Remove script, style, nav, footer, header elements
    $('script, style, nav, footer, header, aside, .advertisement, .ads').remove();
    
    // Extract text from main content areas
    let text = '';
    
    // Try to find main content
    const mainSelectors = [
      'main',
      'article',
      '[role="main"]',
      '.content',
      '.main-content',
      '#content',
      '#main-content',
      'body'
    ];
    
    for (const selector of mainSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        text = element.text();
        break;
      }
    }
    
    // Clean up text
    text = text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
    
    if (text.length < 50) {
      throw new Error('Website content too short or not extractable');
    }
    
    console.log(`[TextExtraction] Extracted ${text.length} chars from URL${usedInsecure ? ' (SSL verification disabled)' : ''}`);
    
    return {
      text,
      metadata: {
        source: url,
        type: 'url',
        title: $('title').text().trim() || url
      }
    };
  } catch (error) {
    console.error('[TextExtraction] URL extraction failed:', error.message);
    
    // Provide more user-friendly error messages
    if (error.message?.includes('certificate') || error.message?.includes('UNABLE_TO_VERIFY')) {
      throw new Error(`SSL certificate error for ${url}. The website has an invalid or self-signed certificate.`);
    }
    if (error.message?.includes('fetch failed') || error.code === 'ENOTFOUND') {
      throw new Error(`Cannot reach ${url}. Please check the URL is correct and the website is accessible.`);
    }
    if (error.message?.includes('timeout')) {
      throw new Error(`Request to ${url} timed out. The website may be slow or unresponsive.`);
    }
    
    throw error;
  }
}

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 */
async function extractFromPdf(filePath) {
  try {
    console.log('[TextExtraction] Reading PDF:', filePath);
    
    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    
    console.log(`[TextExtraction] Extracted ${data.text.length} chars from PDF`);
    
    return {
      text: data.text,
      metadata: {
        source: path.basename(filePath),
        type: 'pdf',
        title: data.info?.Title || path.basename(filePath),
        pages: data.numpages
      }
    };
  } catch (error) {
    console.error('[TextExtraction] PDF extraction failed:', error);
    throw error;
  }
}

/**
 * Extract text from text file
 * @param {string} filePath - Path to text file
 */
async function extractFromTextFile(filePath) {
  try {
    console.log('[TextExtraction] Reading text file:', filePath);
    
    const text = fs.readFileSync(filePath, 'utf-8');
    
    console.log(`[TextExtraction] Extracted ${text.length} chars from text file`);
    
    return {
      text,
      metadata: {
        source: path.basename(filePath),
        type: 'text',
        title: path.basename(filePath)
      }
    };
  } catch (error) {
    console.error('[TextExtraction] Text file extraction failed:', error);
    throw error;
  }
}

/**
 * Extract text based on file type
 * @param {string} filePath - Path to file
 */
async function extractFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  switch (ext) {
    case '.pdf':
      return extractFromPdf(filePath);
    case '.txt':
    case '.md':
    case '.json':
      return extractFromTextFile(filePath);
    default:
      throw new Error(`Unsupported file type: ${ext}`);
  }
}

/**
 * Chunk text into smaller pieces
 * @param {string} text - Text to chunk
 * @param {number} chunkSize - Target chunk size in characters
 * @param {number} overlap - Overlap between chunks
 */
function chunkText(text, chunkSize = 800, overlap = 100) {
  const chunks = [];
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize) {
      // Save current chunk
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
      }
      
      // Start new chunk with overlap
      if (overlap > 0 && currentChunk.length > 0) {
        const words = currentChunk.split(' ');
        const overlapWords = words.slice(-Math.floor(overlap / 5)); // Approximate word count
        currentChunk = overlapWords.join(' ') + ' ' + sentence;
      } else {
        currentChunk = sentence;
      }
    } else {
      currentChunk += (currentChunk.length > 0 ? ' ' : '') + sentence;
    }
  }
  
  // Add final chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  console.log(`[TextExtraction] Created ${chunks.length} chunks from text`);
  return chunks;
}

/**
 * Crawl entire website starting from URL
 * @param {string} startUrl - Starting URL
 * @param {Object} options - Crawler options
 * @param {number} options.maxPages - Maximum pages to crawl (default: 10)
 * @param {number} options.maxDepth - Maximum crawl depth (default: 2)
 * @param {string[]} options.allowedDomains - Allowed domains (default: same domain as startUrl)
 * @returns {Promise<Array>} - Array of {url, text, metadata} objects
 */
async function crawlWebsite(startUrl, options = {}) {
  const { 
    maxPages = 10, 
    maxDepth = 2,
    allowedDomains = null 
  } = options;
  
  const startDomain = new URL(startUrl).hostname;
  const domains = allowedDomains || [startDomain];
  
  const crawled = new Set();
  const queue = [{ url: startUrl, depth: 0 }];
  const results = [];
  
  console.log(`[Crawler] Starting crawl from: ${startUrl}`);
  console.log(`[Crawler] Max pages: ${maxPages}, Max depth: ${maxDepth}`);
  
  while (queue.length > 0 && crawled.size < maxPages) {
    const { url, depth } = queue.shift();
    
    if (crawled.has(url) || depth > maxDepth) {
      continue;
    }
    
    // Check domain
    const urlDomain = new URL(url).hostname;
    if (!domains.some(d => urlDomain === d || urlDomain.endsWith('.' + d))) {
      continue;
    }
    
    console.log(`[Crawler] Crawling [${crawled.size + 1}/${maxPages}]: ${url} (depth: ${depth})`);
    
    try {
      // Extract content from URL (also get raw HTML for link extraction)
      const data = await extractFromUrlWithHtml(url);
      
      results.push({
        url,
        text: data.text,
        metadata: data.metadata
      });
      
      crawled.add(url);
      
      // Extract links for further crawling (use raw HTML)
      if (depth < maxDepth && crawled.size < maxPages) {
        const links = extractLinks(data.html, url, data.metadata.title || '');
        console.log(`[Crawler] Found ${links.length} links on ${url}`);
        
        for (const link of links) {
          if (!crawled.has(link) && !queue.some(item => item.url === link)) {
            queue.push({ url: link, depth: depth + 1 });
          }
        }
      }
    } catch (error) {
      console.error(`[Crawler] Failed to crawl ${url}:`, error.message);
      crawled.add(url); // Mark as crawled to avoid retrying
    }
  }
  
  console.log(`[Crawler] Completed. Crawled ${results.length} pages`);
  return results;
}

/**
 * Extract text from URL and return both cleaned text and raw HTML
 * @param {string} url - Website URL
 */
async function extractFromUrlWithHtml(url) {
  // Reuse the existing fetch logic from extractFromUrl
  let html;
  let usedInsecure = false;
  
  try {
    console.log('[TextExtraction] Scraping URL:', url);
    
    // Try normal fetch first
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      html = await response.text();
    } catch (fetchError) {
      // If SSL error, retry with insecure mode
      const causeMessage = fetchError.cause?.message || '';
      const isSSLError = fetchError.message?.includes('certificate') || 
                         fetchError.message?.includes('UNABLE_TO_VERIFY') ||
                         causeMessage.includes('certificate') ||
                         causeMessage.includes('self-signed') ||
                         fetchError.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE';
      
      if (isSSLError) {
        console.log('[TextExtraction] SSL certificate error, retrying with insecure mode...');
        try {
          html = await fetchInsecure(url);
          usedInsecure = true;
        } catch (insecureError) {
          throw new Error(`SSL certificate error: ${insecureError.message}`);
        }
      } else {
        throw fetchError;
      }
    }
    
    if (!html || html.length < 100) {
      throw new Error('Website returned empty or minimal content');
    }
    
    // Save raw HTML for link extraction
    const rawHtml = html;
    
    const $ = cheerio.load(html);
    
    // Remove script, style, nav, footer, header elements
    $('script, style, nav, footer, header, aside, .advertisement, .ads').remove();
    
    // Extract text from main content areas
    let text = '';
    const mainSelectors = ['main', 'article', '[role="main"]', '.content', '.main-content', '#content', '#main-content', 'body'];
    
    for (const selector of mainSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        text = element.text();
        break;
      }
    }
    
    // Clean up text
    text = text.replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim();
    
    if (text.length < 50) {
      throw new Error('Website content too short or not extractable');
    }
    
    console.log(`[TextExtraction] Extracted ${text.length} chars from URL${usedInsecure ? ' (SSL verification disabled)' : ''}`);
    
    return {
      text,
      html: rawHtml,
      metadata: {
        source: url,
        type: 'url',
        title: $('title').text().trim() || url
      }
    };
  } catch (error) {
    console.error('[TextExtraction] URL extraction failed:', error.message);
    throw error;
  }
}

/**
 * Extract links from HTML content
 * @param {string} html - HTML content
 * @param {string} baseUrl - Base URL for resolving relative links
 * @param {string} title - Page title
 * @returns {string[]} - Array of absolute URLs
 */
function extractLinks(html, baseUrl, title) {
  const links = [];
  const $ = cheerio.load(html);
  
  $('a[href]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) return;
    
    // Skip anchors, javascript, mailto, tel
    if (href.startsWith('#') || href.startsWith('javascript:') || 
        href.startsWith('mailto:') || href.startsWith('tel:')) {
      return;
    }
    
    try {
      // Resolve relative URLs
      const absoluteUrl = new URL(href, baseUrl).toString();
      
      // Skip non-HTTP protocols
      if (!absoluteUrl.startsWith('http://') && !absoluteUrl.startsWith('https://')) {
        return;
      }
      
      // Skip common non-content URLs
      const skipPatterns = [
        /\.(pdf|jpg|jpeg|png|gif|svg|css|js|zip|tar|gz|mp3|mp4|avi|mov)$/i,
        /\/wp-admin/,
        /\/wp-login/,
        /\/login/,
        /\/logout/,
        /\/cart/,
        /\/checkout/,
        /\?.*redirect/,
        /\?.*logout/
      ];
      
      if (skipPatterns.some(pattern => pattern.test(absoluteUrl))) {
        return;
      }
      
      links.push(absoluteUrl);
    } catch (e) {
      // Invalid URL, skip
    }
  });
  
  // Remove duplicates
  return [...new Set(links)];
}

module.exports = {
  extractFromUrl,
  extractFromUrlWithHtml,
  extractFromPdf,
  extractFromTextFile,
  extractFromFile,
  chunkText,
  crawlWebsite,
  extractLinks
};
