const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbHost = process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com';
const dbPort = parseInt(process.env.DB_PORT) || 4000;
const dbUser = process.env.DB_USER || '3L5XjoEyrEmS4PU.root';
const dbPassword = process.env.DB_PASSWORD || 'gAQ3i0GTAdgXWu5K';
const dbName = process.env.DB_NAME || 'test';

// detect environment
const isProd = process.env.NODE_ENV === 'production' || !!process.env.RENDER;

const finalHost = isProd ? 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com' : dbHost;
const finalPort = isProd ? 4000 : dbPort;
const finalUser = isProd ? '3L5XjoEyrEmS4PU.root' : (process.env.DB_USER || 'root');
const finalPassword = isProd ? 'gAQ3i0GTAdgXWu5K' : (process.env.DB_PASSWORD || '');
const finalDbName = isProd ? 'test' : (process.env.DB_NAME || 'hall_booking');
const finalSSL = isProd || process.env.DB_SSL === 'true';

console.log(`[DB INIT] Env: ${isProd ? 'Production' : 'Local'}, Host: ${finalHost}, DB: ${finalDbName}`);

const pool = mysql.createPool({
    host: finalHost,
    user: finalUser,
    password: finalPassword,
    database: finalDbName,
    port: finalPort,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: false }
});

// Basic check
pool.getConnection()
    .then(conn => {
        console.log('✅ Database connected successfully to:', finalHost);
        conn.release();
    })
    .catch(err => {
        console.error('❌ Database connection failed:', err.message);
    });

module.exports = pool;
