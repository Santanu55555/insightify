require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { upload, uploadRoute } = require('./routes/upload');
const { getMetricsRoute } = require('./routes/metrics');
const { aiInsightsRoute } = require('./routes/aiInsights');
const { getHistoryRoute } = require('./routes/history');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Insightify API is running.' });
});

app.get('/metrics', getMetricsRoute);

app.post('/upload', upload.single('file'), uploadRoute);
app.post('/ai-insights', aiInsightsRoute);
app.get('/history', getHistoryRoute);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
