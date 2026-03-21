const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Configs
const remoteConfig = {
    host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: parseInt(process.env.DB_PORT) || 4000,
    user: process.env.DB_USER || '3L5XjoEyrEmS4PU.root',
    password: process.env.DB_PASSWORD || 'gAQ3i0GTAdgXWu5K',
    database: process.env.DB_NAME || 'hall_booking',
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 5000, // 5s timeout to avoid long waits
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: false }
};

const localConfig = {
    host: process.env.LOCAL_DB_HOST || 'localhost',
    port: parseInt(process.env.LOCAL_DB_PORT) || 3306,
    user: process.env.LOCAL_DB_USER || 'root',
    password: process.env.LOCAL_DB_PASSWORD || '',
    database: process.env.LOCAL_DB_NAME || 'hall_booking',
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 3000
};

// Create Pools
const remotePool = mysql.createPool(remoteConfig);
const localPool = mysql.createPool(localConfig);

const IS_MUTATION = (sql) => {
    const q = (typeof sql === 'string' ? sql : (sql.sql || '')).trim();
    return /^\s*(INSERT|UPDATE|DELETE|REPLACE|CREATE|ALTER|DROP|TRUNCATE|PATCH)/i.test(q);
};

// Robust query executor with parallel processing for speed
const db = {
    async query(sql, params) {
        const isMutation = IS_MUTATION(sql);
        
        if (isMutation) {
            console.log('🔄 [DB SYNC] Mutation Starting...');
            
            // Execute on both in parallel but wait for at least one success
            const remotePromise = remotePool.query(sql, params);
            const localPromise = localPool.query(sql, params);

            try {
                // Wait for both, but even if one fails, we want the result
                const [remoteRes, localRes] = await Promise.allSettled([remotePromise, localPromise]);
                
                if (remoteRes.status === 'fulfilled') {
                    console.log('✅ Remote DB Updated');
                    if (localRes.status === 'fulfilled') console.log('✅ Local DB Updated');
                    return remoteRes.value; 
                } else if (localRes.status === 'fulfilled') {
                    console.warn('⚠️ Remote Failed, but Local DB Updated:', remoteRes.reason.message);
                    return localRes.value;
                } else {
                    throw new Error('Both databases failed: ' + remoteRes.reason.message);
                }
            } catch (err) {
                console.error('❌ Sync Critical Error:', err.message);
                throw err;
            }
        } else {
            // Read: Try Remote first with a timeout, fallback to Local
            try {
                // Using a fast race if remote is slow could be risky for consistency,
                // so we prioritize remote but with a fallback.
                return await remotePool.query(sql, params);
            } catch (err) {
                console.warn('⚠️ Remote Read Failed, using Localhost fallback:', err.message);
                return await localPool.query(sql, params);
            }
        }
    },

    async execute(sql, params) {
        return this.query(sql, params);
    },

    remotePool,
    localPool,
    pool: remotePool,

    async getConnection() {
        try {
            const conn = await remotePool.getConnection();
            return conn;
        } catch (err) {
            return await localPool.getConnection();
        }
    }
};


// Small interval to keep connections alive
setInterval(() => {
    remotePool.query('SELECT 1').catch(() => {});
    localPool.query('SELECT 1').catch(() => {});
}, 30000);

module.exports = db;

