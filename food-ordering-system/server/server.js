const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Test endpoint
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Register endpoint
app.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Register user through db.js
  db.registerUser(email, password, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Registration failed', error: err });
    }
    res.status(201).json(result);
  });
});

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Login user through db.js
  db.loginUser(email, password, (err, result) => {
    if (err) {
      return res.status(401).json({ message: err.message || 'Login failed' });
    }
    res.status(200).json(result);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
