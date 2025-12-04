const { Pool } = require('pg');
require('dotenv').config();

console.log("Database URL Check:", process.env.DATABASE_URL ? "TERBACA" : "KOSONG/UNDEFINED");
// VULNERABILITY: Hardcoded credentials dan tidak ada sanitization
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false // Tidak menggunakan SSL - insecure
});

module.exports = pool;