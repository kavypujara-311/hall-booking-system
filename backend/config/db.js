const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

const pool = mysql.createPool({
    host: isProd ? 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com' : (process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com'),
    user: isProd ? '3L5XjoEyrEmS4PU.root' : (process.env.DB_USER || '3L5XjoEyrEmS4PU.root'),
    password: isProd ? 'MZpSTHXp37kDK6Sq' : (process.env.DB_PASSWORD || 'MZpSTHXp37kDK6Sq'),
    database: isProd ? 'test' : (process.env.DB_NAME || 'test'),
    port: isProd ? 4000 : (parseInt(process.env.DB_PORT) || 4000),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000,
    ssl: (isProd || (!process.env.DB_HOST || process.env.DB_HOST.includes('tidbcloud.com'))) 
        ? { minVersion: 'TLSv1.2', rejectUnauthorized: false } 
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
