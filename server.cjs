require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const askGpt = require('./api/ask-gpt.cjs');
const scrapeCompanyInfo = require('./api/scrape-company-info.cjs');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Serve static files from the frontend build (if you build the React app)
app.use(express.static(path.join(__dirname, 'dist')));

// API routes
app.post('/api/ask-gpt', askGpt);
app.use(scrapeCompanyInfo);

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 