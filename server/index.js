const express = require('express');
const cors = require('cors');
const multer = require('multer');
const csv = require('csv-parser');
const { Readable } = require('stream');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    console.error('Upload Error: No file provided');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  if (req.file.mimetype !== 'text/csv' && !req.file.originalname.endsWith('.csv')) {
    console.error(`Upload Error: Invalid file type ${req.file.mimetype} for file ${req.file.originalname}`);
    return res.status(400).json({ error: 'Please upload a valid CSV file' });
  }

  console.log(`[CSV Parse Start] Processing file: ${req.file.originalname} (${req.file.size} bytes)`);
  
  const results = [];
  const stream = Readable.from(req.file.buffer);

  stream
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      console.log(`[CSV Parse Success] Successfully parsed ${results.length} rows.`);
      res.status(200).json({ data: results });
    })
    .on('error', (error) => {
      console.error('[CSV Parse Error]: ', error);
      res.status(500).json({ error: 'Failed to parse CSV file' });
    });
});

app.get('/', (req, res) => {
  res.send('CSV Uploader API Server is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
