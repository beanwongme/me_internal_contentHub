const fetch = require('node-fetch');

async function test() {
  const response = await fetch(
    'https://api.trychroma.com/api/v2/tenants/a56f174a-61e7-4f6c-aa55-f6a22659db9d/databases/contentHub/collections/7d68958c-fce2-4d29-9bd0-1b17c5c8f278/get',
    {
      method: 'POST',
      headers: { 
        'x-chroma-token': 'ck-ANBu3WAcFRNuG39MnX42AHTvmdnzqMGgR2XawzTMeCxP', 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ limit: 1000 })
    }
  );
  
  const data = await response.json();
  console.log('Total documents:', data.documents.length);
  
  // Show sources
  const sources = {};
  data.metadatas.forEach(m => {
    const src = m.source || 'unknown';
    sources[src] = (sources[src] || 0) + 1;
  });
  console.log('Sources:', sources);
  
  // Find me.hk documents
  const mehkIndices = data.metadatas
    .map((m, i) => m.source === 'https://me.hk' ? i : -1)
    .filter(i => i !== -1);
  
  console.log('\nme.hk documents:', mehkIndices.length);
  mehkIndices.forEach((idx, i) => {
    console.log(`\n--- Doc ${i + 1} ---`);
    console.log('Source:', data.metadatas[idx].source);
    console.log('Text:', data.documents[idx].substring(0, 400));
  });
}

test().catch(console.error);
