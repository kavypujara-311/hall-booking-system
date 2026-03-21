const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Detection for Production (Render, etc.)
const IS_PROD = process.env.NODE_ENV === 'production' || !!process.env.RENDER;

// Configs
const remoteConfig = {
    host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: parseInt(process.env.DB_PORT) || 4000,
    user: process.env.DB_USER || '3L5XjoEyrEmS4PU.root',
    password: process.env.DB_PASSWORD || 'gAQ3i0GTAdgXWu5K',
    database: process.env.DB_NAME || 'hall_booking',
    waitForConnections: true,
    connectionLimit: IS_PROD ? 20 : 10,
    connectTimeout: 10000, // 10s for remote
    ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: false }
};

const localConfig = {
    host: process.env.LOCAL_DB_HOST || 'localhost',
    port: parseInt(process.env.LOCAL_DB_PORT) || 3306,
    user: process.env.LOCAL_DB_USER || 'root',
    password: process.env.LOCAL_DB_PASSWORD || '',
    database: process.env.LOCAL_DB_NAME || 'hall_booking',
    waitForConnections: true,
    connectionLimit: 5,
    connectTimeout: 3000
};

// Create Pools
const remotePool = mysql.createPool(remoteConfig);
// Only create local pool if NOT in production to save resources and avoid errors
const localPool = !IS_PROD ? mysql.createPool(localConfig) : null;

const IS_MUTATION = (sql) => {
    const q = (typeof sql === 'string' ? sql : (sql.sql || '')).trim();
    return /^\s*(INSERT|UPDATE|DELETE|REPLACE|CREATE|ALTER|DROP|TRUNCATE|PATCH)/i.test(q);
};

const db = {
    async query(sql, params) {
        const isMutation = IS_MUTATION(sql);
        
        // --- PRODUCTION LOGIC (No Local Sync) ---
        if (IS_PROD) {
            try {
                return await remotePool.query(sql, params);
            } catch (err) {
                console.error('❌ Remote DB Error:', err.message);
                throw err;
            }
        }

        // --- DEVELOPMENT LOGIC (With Local Sync) ---
        if (isMutation) {
            console.log('🔄 [DB SYNC] Mutation Starting (Dev Mode)...');
            const remotePromise = remotePool.query(sql, params);
            const localPromise = localPool ? localPool.query(sql, params) : Promise.reject('No local pool');

            try {
                const [remoteRes, localRes] = await Promise.allSettled([remotePromise, localPromise]);
                
                if (remoteRes.status === 'fulfilled') {
                    if (localRes.status === 'fulfilled') console.log('✅ Local & Remote DB Updated');
                    return remoteRes.value; 
                } else if (localRes.status === 'fulfilled') {
                    console.warn('⚠️ Remote Failed, but Local DB Updated');
                    return localRes.value;
                } else {
                    throw new Error('Both databases failed: ' + remoteRes.reason?.message);
                }
            } catch (err) {
                console.error('❌ Sync Critical Error:', err.message);
                throw err;
            }
        } else {
            // Read: Try Remote first, fallback to Local
            try {
                return await remotePool.query(sql, params);
            } catch (err) {
                if (localPool) {
                    console.warn('⚠️ Remote Failed, using Localhost fallback:', err.message);
                    return await localPool.query(sql, params);
                }
                throw err;
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
            return await remotePool.getConnection();
        } catch (err) {
            if (localPool) return await localPool.getConnection();
            throw err;
        }
    }
};

// Keep alive - only for the pools that exist
setInterval(() => {
    remotePool.query('SELECT 1').catch(() => {});
    if (localPool) localPool.query('SELECT 1').catch(() => {});
}, 30000);

module.exports = db;

