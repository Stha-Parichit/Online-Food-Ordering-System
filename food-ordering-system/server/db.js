const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'detrous', // Replace with your MySQL username
  password: 'admin', // Replace with your MySQL password
});

// Connect to MySQL server
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL server');

  // Ensure the database and tables exist
  const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS food_ordering`;
  db.query(createDatabaseQuery, (err) => {
    if (err) throw err;
    console.log('Database ensured');

    db.changeUser({ database: 'food_ordering' }, (err) => {
      if (err) throw err;

      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      db.query(createTableQuery, (err) => {
        if (err) throw err;
        console.log('Users table ensured');
      });
    });
  });
});

// Helper function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    'your_secret_key', // Use a secret key for signing the token
    { expiresIn: '1h' } // Token expiration time (1 hour)
  );
};

// Register user
const registerUser = (email, password, callback) => {
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return callback(err);

    const query = `INSERT INTO users (email, password) VALUES (?, ?)`;
    db.query(query, [email, hashedPassword], (err, result) => {
      if (err) return callback(err);
      callback(null, { message: 'User registered successfully' });
    });
  });
};

// Login user
const loginUser = (email, password, callback) => {
  const query = `SELECT * FROM users WHERE email = ?`;
  db.query(query, [email], (err, result) => {
    if (err) return callback(err);
    if (result.length === 0) return callback({ message: 'User not found' });

    const user = result[0];

    // Compare the provided password with the hashed password in the database
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return callback(err);
      if (!isMatch) return callback({ message: 'Invalid credentials' });

      // Generate JWT token
      const token = generateToken(user);
      callback(null, { message: 'Login successful', token });
    });
  });
};

// Export the functions for use in other files
module.exports = {
  registerUser,
  loginUser,
  db
};
