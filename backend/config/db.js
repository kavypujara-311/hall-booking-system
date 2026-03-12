const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbHost = process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com';
const dbPort = parseInt(process.env.DB_PORT) || 4000;
const dbUser = process.env.DB_USER || '3L5XjoEyrEmS4PU.root';
const dbPassword = process.env.DB_PASSWORD || 'gAQ3i0GTAdgXWu5K';
const dbName = process.env.DB_NAME || 'hall_booking';

// Force use of TiDB in Production (Render always sets PORT)
const isProd = process.env.NODE_ENV === 'production' || !!process.env.PORT || !!process.env.RENDER;

const finalHost = isProd ? 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com' : dbHost;
const finalPort = isProd ? 4000 : dbPort;
const finalUser = isProd ? '3L5XjoEyrEmS4PU.root' : dbUser;
const finalPassword = isProd ? 'gAQ3i0GTAdgXWu5K' : dbPassword;
const finalDbName = isProd ? 'hall_booking' : dbName;
const finalSSL = true;

console.log(`[DB INIT] Target: ${finalHost}:${finalPort} | DB: ${finalDbName}`);

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
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true }
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
