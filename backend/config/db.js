const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT) || 3306;
const useSSL = process.env.DB_SSL === 'true' || dbHost.includes('tidbcloud.com') || dbHost.includes('planetscale') || dbHost.includes('railway');

// Render Fallback override (Hardcoded specifically to fix the live site instantly without dashboard config)
const isRenderProd = process.env.NODE_ENV === 'production';
const finalHost = isRenderProd ? 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com' : dbHost;
const finalPort = isRenderProd ? 4000 : dbPort;
const finalUser = isRenderProd ? '3L5XjoEyrEmS4PU.root' : (process.env.DB_USER || 'root');
const finalPassword = isRenderProd ? 'gAQ3i0GTAdgXWu5K' : (process.env.DB_PASSWORD || '');
const finalDbName = isRenderProd ? 'hall_booking' : (process.env.DB_NAME || 'hall_booking');
const finalSSL = isRenderProd ? true : useSSL;

console.log(`[DB INIT] NODE_ENV: ${process.env.NODE_ENV}, Host: ${finalHost}, Port: ${finalPort}, User: ${finalUser}, SSL: ${finalSSL}`);

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
    ssl: finalSSL ? { minVersion: 'TLSv1.2', rejectUnauthorized: false } : undefined
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
