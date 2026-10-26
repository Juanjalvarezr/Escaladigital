require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('GEMINI_API_KEY no configurada. Crea un .env con GEMINI_API_KEY=***');
}

const app = express();
app.use(bodyParser.json());

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const FALLBACK_MODELS = (process.env.GEMINI_FALLBACK_MODELS || 'gemini-2.5-flash,gemini-pro-latest,gemini-2.0-flash').split(',').map(s => s.trim()).filter(Boolean);

function normalizeModel(m) {
  return String(m || '').replace(/^models\//, '');
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Model request timed out')), ms))
  ]);
}

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

async function callGemini(model, prompt) {
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': API_KEY
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error('HTTP ' + res.status + ': ' + JSON.stringify(data));
  }
  const text = (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) ? data.candidates[0].content.parts.map(function(p){return p.text;}).join('') : '';
  return text;
}

app.post('/api/gemini', async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });
  try {
    if (typeof prompt === 'string' && prompt.trim() === '__LOCAL_TEST__') {
      const sample = { businessType: 'retail', mainChallenge: 'ventas' };
      return res.json({ text: JSON.stringify(sample), parsed: sample });
    }

    if (!API_KEY) {
      return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

    const tryModels = [normalizeModel(DEFAULT_MODEL)].concat(FALLBACK_MODELS.map(normalizeModel).filter(function(m){return m !== normalizeModel(DEFAULT_MODEL);}));
    let usedModel = null;
    let text = null;
    let lastErr = null;
    for (const candidate of tryModels) {
      try {
        text = await withTimeout(callGemini(candidate, prompt), 25000);
        usedModel = candidate;
        break;
      } catch (genErr) {
        lastErr = genErr;
        console.warn('Model failed', candidate, genErr && genErr.message ? genErr.message : genErr);
      }
    }

    if (text === null && lastErr) {
      return res.status(502).json({ error: 'All models failed: ' + lastErr.message });
    }

    let parsed = null;
    try {
      const jsonMatch = (text || '').match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      parsed = null;
    }

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
  console.log('Gemini proxy running on http://localhost:' + PORT + '/api/gemini');
});
