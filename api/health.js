module.exports = async (req, res) => {
  res.json({ status: 'ok', modelDefault: process.env.GEMINI_MODEL || 'gemini-3.8-flash' });
};
