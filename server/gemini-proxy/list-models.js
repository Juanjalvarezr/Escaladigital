require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error('GEMINI_API_KEY not set in environment. Set it in .env and retry.');
  process.exit(2);
}

const genAI = new GoogleGenerativeAI(API_KEY || '');

(async () => {
  try {
    if (typeof genAI.listModels !== 'function') {
      console.error('Client does not expose listModels().');
      process.exit(3);
    }
    const resp = await genAI.listModels();
    console.log('ListModels response:');
    console.log(JSON.stringify(resp, null, 2));
  } catch (err) {
    console.error('Error calling listModels:', err && err.message ? err.message : err);
    process.exit(4);
  }
})();
