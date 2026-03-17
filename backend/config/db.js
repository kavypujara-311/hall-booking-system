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
const finalDbName = process.env.DB_NAME || 'hall_booking';
const finalSSL = isProd || process.env.DB_SSL === 'true';


const poolConfig = {
    host: finalHost,
    user: finalUser,
    password: finalPassword,
    port: finalPort,
    database: finalDbName, // Specify database here
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000,
    // ONLY use SSL if it's not localhost
    ssl: (finalHost !== 'localhost' && finalHost !== '127.0.0.1') 
         ? { minVersion: 'TLSv1.2', rejectUnauthorized: false } 
         : undefined
};

// Create the pool
const pool = mysql.createPool(poolConfig);

// Helper for initialization
pool.initializeDatabase = async () => {
    // Initialization logic removed
};

// Start initialization
pool.initializeDatabase();

module.exports = pool;

