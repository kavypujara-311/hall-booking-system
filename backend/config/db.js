const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// TiDB Cloud Production Config
const tidbConfig = {
    host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: parseInt(process.env.DB_PORT) || 4000,
    user: process.env.DB_USER || '3L5XjoEyrEmS4PU.root',
    password: process.env.DB_PASSWORD || 'gAQ3i0GTAdgXWu5K',
    database: process.env.DB_NAME || 'hall_booking',
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 5000,
    ssl: {
        rejectUnauthorized: false
    }
};

// Create Pool
const pool = mysql.createPool(tidbConfig);

const db = {
    async query(sql, params) {
        return await pool.query(sql, params);
    },

    async execute(sql, params) {
        return this.query(sql, params);
    },

    pool: pool,

    async getConnection() {
        return await pool.getConnection();
    }
};

// Keep alive
setInterval(() => {
    pool.query('SELECT 1').catch(() => {});
}, 30000);

module.exports = db;
