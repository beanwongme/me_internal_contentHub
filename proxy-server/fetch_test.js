const https = require('https');

function fetchInsecure(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    if (maxRedirects <= 0) return reject(new Error('Too many redirects'));
    const client = url.startsWith('https:') ? https : require('http');
    const options = {
      rejectUnauthorized: false,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    };
    client.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        const redirectUrl = new URL(res.headers.location, url).toString();
        return fetchInsecure(redirectUrl, maxRedirects - 1).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

fetchInsecure('https://me.hk').then(html => {
  // Find some links
  const matches = html.match(/href=["']([^"']+)["']/g);
  console.log('Sample links from HTML:');
  matches.slice(0, 15).forEach(m => console.log(' ', m));
}).catch(console.error);
