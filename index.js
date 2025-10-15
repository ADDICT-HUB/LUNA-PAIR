const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

// Load routes
const server = require('./qr');
const code = require('./pair');

// Set up max listeners to prevent memory leak warnings
require('events').EventEmitter.defaultMaxListeners = 500;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Route handlers
app.use('/server', server);
app.use('/code', code);

// Static pages
app.get('/pair', (req, res) => {
  res.sendFile(path.join(__dirname, 'pair.html'));
});

app.get('/qr', (req, res) => {
  res.sendFile(path.join(__dirname, 'qr.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.html'));
});

// Port binding for Heroku / Render
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('⭐ Don’t forget to star MALVIN-XD!');
});

module.exports = app;
