const { Pool } = require('pg');
require('dotenv').config();

// VULNERABILITY: Hardcoded credentials dan tidak ada sanitization
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false // Tidak menggunakan SSL - insecure
});

module.exports = pool;