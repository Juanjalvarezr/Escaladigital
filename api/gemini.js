const API_KEY = process.env.GEMINI_API_KEY;
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const FALLBACK_MODELS = (process.env.GEMINI_FALLBACK_MODELS || 'gemini-3.8-flash').split(',').map(s => s.trim()).filter(Boolean);

function normalizeModel(m) {
  return String(m || '').replace(/^models\//, '');
}

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
  const text = (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts)
    ? data.candidates[0].content.parts.map(p => p.text).join('')
    : '';
  return text;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  if (typeof prompt === 'string' && prompt.trim() === '__LOCAL_TEST__') {
    const sample = { businessType: 'retail', mainChallenge: 'ventas' };
    return res.json({ text: JSON.stringify(sample), parsed: sample });
  }

  if (!API_KEY) {
    return res.status(503).json({ error: 'GEMINI_API_KEY not configured' });
  }

  const tryModels = [normalizeModel(DEFAULT_MODEL), ...FALLBACK_MODELS.map(normalizeModel).filter(m => m !== normalizeModel(DEFAULT_MODEL))];
  let usedModel = null;
  let text = null;
  let lastErr = null;

  for (const candidate of tryModels) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + candidate + ':generateContent';
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': API_KEY },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      const data = await r.json();
      if (!r.ok) throw new Error('HTTP ' + r.status + ': ' + JSON.stringify(data));
      text = (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts)
        ? data.candidates[0].content.parts.map(p => p.text).join('')
        : '';
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
    if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    parsed = null;
  }

  res.json({ model: usedModel, text, parsed });
};
