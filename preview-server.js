const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Preview server running at http://0.0.0.0:${port}`);
  console.log(`Serving built files from: ${path.join(__dirname, 'dist')}`);
});