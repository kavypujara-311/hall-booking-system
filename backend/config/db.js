const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT) || 3306;
const useSSL = process.env.DB_SSL === 'true' || dbHost.includes('tidbcloud.com') || dbHost.includes('planetscale') || dbHost.includes('railway');

const pool = mysql.createPool({
    host: dbHost,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hall_booking',
    port: dbPort,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    ssl: useSSL ? { minVersion: 'TLSv1.2', rejectUnauthorized: false } : undefined
});

// Basic check
pool.getConnection()
    .then(conn => {
        console.log('✅ Database connected successfully to:', dbHost);
        conn.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
    });

module.exports = pool;
