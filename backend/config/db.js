const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Localhost Only Config
const localConfig = {
    host: process.env.LOCAL_DB_HOST || 'localhost',
    port: parseInt(process.env.LOCAL_DB_PORT) || 3306,
    user: process.env.LOCAL_DB_USER || 'root',
    password: process.env.LOCAL_DB_PASSWORD || '',
    database: process.env.LOCAL_DB_NAME || 'hall_booking',
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 5000 
};

// Create Pool
const pool = mysql.createPool(localConfig);

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
