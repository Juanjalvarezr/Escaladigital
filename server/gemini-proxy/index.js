require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const { GoogleGenerativeAI } = require('@google/generative-ai');

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('⚠️ GEMINI_API_KEY no configurada. Crea un .env con GEMINI_API_KEY=tu_key');
}

const app = express();
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(API_KEY || '');
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.0';
const FALLBACK_MODELS = (process.env.GEMINI_FALLBACK_MODELS || 'gemini-1.5-flash,gemini-1.5,gemini-1.0,text-bison@001').split(',').map(s => s.trim()).filter(Boolean);

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Model request timed out')), ms))
  ]);
}

// Global handlers to avoid process exit on unhandled errors (helps dev stability)
process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

app.post('/api/gemini', async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });
  try {
    // Shortcut for local testing without calling Gemini (useful if no network/key)
    if (typeof prompt === 'string' && prompt.trim() === '__LOCAL_TEST__') {
      const sample = { businessType: 'retail', mainChallenge: 'ventas' };
      return res.json({ text: JSON.stringify(sample), parsed: sample });
    }

    if (!API_KEY) {
      // If no API key is configured, we still support the __LOCAL_TEST__ shortcut above.
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    // Create a model per-request (safer if model availability changes)
    const modelName = process.env.GEMINI_MODEL || DEFAULT_MODEL;
    let model = null;
    let usedModel = null;

    const tryModels = [modelName, ...FALLBACK_MODELS.filter(m => m !== modelName)];
    for (const candidate of tryModels) {
      try {
        model = genAI.getGenerativeModel({ model: candidate });
        usedModel = candidate;
        break;
      } catch (merr) {
        console.warn('Could not create model', candidate, merr && merr.message ? merr.message : merr);
        model = null;
      }
    }

    if (!model) {
      return res.status(500).json({ error: `No configured models available: tried ${tryModels.join(', ')}` });
    }

    // Call the model with a timeout to avoid hanging requests
    let result;
    try {
      result = await withTimeout(model.generateContent(prompt), 25_000);
    } catch (genErr) {
      console.error('Error generating content with model', usedModel, genErr && genErr.message ? genErr.message : genErr);
      return res.status(502).json({ error: `Model ${usedModel} generation error: ${genErr && genErr.message ? genErr.message : String(genErr)}` });
    }

    // result may contain a `response` object (fetch Response) or other structure
    let text = null;
    if (result && result.response && typeof result.response.text === 'function') {
      text = await result.response.text();
    } else if (result && result.output && Array.isArray(result.output) && result.output[0] && result.output[0].content) {
      text = result.output[0].content;
      if (typeof text !== 'string') text = JSON.stringify(text);
    } else {
      text = JSON.stringify(result);
    }

    // Try to extract JSON (object or array) from the text and parse it
    let parsed = null;
    try {
      const jsonMatch = (text || '').match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // ignore parse errors, return raw text
      parsed = null;
    }
    // Include which model was used for easier debugging on the client
    res.json({ model: usedModel, text, parsed });
  } catch (err) {
    console.error('Gemini call error:', err);
    res.status(500).json({ error: String(err) });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', modelDefault: DEFAULT_MODEL, fallbackModels: FALLBACK_MODELS });
});

app.listen(PORT, () => {
  console.log(`Gemini proxy running on http://localhost:${PORT}/api/gemini`);
});
