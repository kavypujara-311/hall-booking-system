const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hall_booking',
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    ssl: (process.env.NODE_ENV === 'production' || (process.env.DB_HOST && process.env.DB_HOST.includes('tidbcloud.com'))) 
        ? { 
            minVersion: 'TLSv1.2',
            rejectUnauthorized: false // Keep false for maximum compatibility, but add minVersion
          } 
        : undefined
});

// Basic check
pool.getConnection()
    .then(conn => {
        console.log('✅ Database connected successfully');
        conn.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
    });

module.exports = pool;
