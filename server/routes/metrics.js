// In-memory store shared with upload data  
// metrics are returned from the last CSV upload directly (not stored between restarts)
let cachedMetrics = [];

function setCachedMetrics(data) {
  cachedMetrics = data;
}

async function getMetricsRoute(req, res) {
  res.status(200).json({ data: cachedMetrics });
}

module.exports = { getMetricsRoute, setCachedMetrics };
