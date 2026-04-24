const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');
const { setCachedMetrics } = require('./metrics');

const storage = multer.memoryStorage();
const upload = multer({ storage });

async function uploadRoute(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (req.file.mimetype !== 'text/csv' && !req.file.originalname.endsWith('.csv')) {
    return res.status(400).json({ error: 'Please upload a valid CSV file' });
  }

  console.log(`[CSV Parse Start] File: ${req.file.originalname} (${req.file.size} bytes)`);

  const results = [];
  const stream = Readable.from(req.file.buffer);

  stream
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      console.log(`[CSV Parse Success] Parsed ${results.length} rows`);
      setCachedMetrics(results);
      res.status(200).json({ data: results });
    })
    .on('error', (error) => {
      console.error('[CSV Parse Error]', error);
      res.status(500).json({ error: 'Failed to parse CSV file' });
    });
}

module.exports = { upload, uploadRoute };
