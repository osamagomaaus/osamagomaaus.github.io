const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',      // change if needed
  user: 'root',           // your MySQL username
  password: 'Oq#5G4@sLz8!Pm',           // your MySQL password
  database: 'bookstore'   // database name
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed: ' + err.stack);
    return;
  }
  console.log('✅ Connected to MySQL database.');
});

module.exports = db;
