require('dotenv').config();
const https = require('https');

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('GEMINI_API_KEY not set in environment. Set it in .env and retry.');
  process.exit(2);
}

function get(path, headers = {}) {
  const options = {
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path,
    method: 'GET',
    headers
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  try {
    console.log('Trying ListModels with Authorization: Bearer <API_KEY>...');
    let r = await get('/v1beta/models', { 'Authorization': `Bearer ${API_KEY}` });
    if (r.status === 200) {
      console.log('Success (Bearer):', JSON.parse(r.body));
      return;
    }
    console.warn('Bearer attempt status', r.status, r.body && r.body.slice && r.body.slice(0,200));

    console.log('Trying ListModels with query param ?key=API_KEY...');
    r = await get(`/v1beta/models?key=${encodeURIComponent(API_KEY)}`);
    if (r.status === 200) {
      console.log('Success (key param):', JSON.parse(r.body));
      return;
    }
    console.warn('Key param attempt status', r.status, r.body && r.body.slice && r.body.slice(0,200));

    console.error('Both attempts failed. The API key may not have permissions or the API surface has changed.');
    process.exit(3);
  } catch (err) {
    console.error('HTTP ListModels error:', err && err.message ? err.message : err);
    process.exit(4);
  }
})();
