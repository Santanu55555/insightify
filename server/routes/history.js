// Simple in-memory history store (per-process)
// For a production app, swap this with a real DB call
const historyStore = {};

function addHistoryEntry(userId, entry) {
  if (!historyStore[userId]) historyStore[userId] = [];
  historyStore[userId].unshift({ id: Date.now().toString(), createdAt: new Date().toISOString(), ...entry });
  // Keep only last 10 entries per user
  historyStore[userId] = historyStore[userId].slice(0, 10);
}

function getHistoryRoute(req, res) {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'UserId is required' });

  const entries = historyStore[userId] || [];
  return res.status(200).json(entries);
}

module.exports = { getHistoryRoute, addHistoryEntry };
