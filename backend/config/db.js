const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

// Detection for Environment
const IS_PROD = process.env.NODE_ENV === 'production' || !!process.env.RENDER;

// Configs
const remoteConfig = {
    host: process.env.DB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
    port: parseInt(process.env.DB_PORT) || 4000,
    user: process.env.DB_USER || '3L5XjoEyrEmS4PU.root',
    password: process.env.DB_PASSWORD || 'gAQ3i0GTAdgXWu5K',
    database: process.env.DB_NAME || 'hall_booking',
    waitForConnections: true,
    connectionLimit: 15,
    connectTimeout: 10000,
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
    connectTimeout: 2000 // Fast timeout for local detection
};

// Create Pools
const remotePool = mysql.createPool(remoteConfig);
const localPool = mysql.createPool(localConfig);

const IS_MUTATION = (sql) => {
    const q = (typeof sql === 'string' ? sql : (sql.sql || '')).trim();
    return /^\s*(INSERT|UPDATE|DELETE|REPLACE|CREATE|ALTER|DROP|TRUNCATE|PATCH)/i.test(q);
};

const db = {
    async query(sql, params) {
        const isMutation = IS_MUTATION(sql);
        
        if (isMutation) {
            // FIRE-AND-FORGET LOCAL SYNC: Start both but prioritize Remote
            // This ensures local sync works when available, but doesn't block Render
            const remotePromise = remotePool.query(sql, params);
            
            // On Local (Dev), we wait for both to ensure sync. 
            // On Render (Prod), we attempt local but don't let it crash the request.
            if (!IS_PROD) {
                console.log('🔄 [DB SYNC] Syncing Local & Remote...');
                try {
                    const [remoteRes, localRes] = await Promise.allSettled([
                        remotePromise,
                        localPool.query(sql, params)
                    ]);
                    
                    if (remoteRes.status === 'fulfilled') return remoteRes.value;
                    if (localRes.status === 'fulfilled') return localRes.value;
                    throw new Error('Both DBs failed: ' + (remoteRes.reason?.message || 'unknown error'));
                } catch (err) {
                    throw err;
                }
            } else {
                // PRODUCTION: Return Remote result immediately, attempt local in background silently
                localPool.query(sql, params).catch(() => {}); // Suppress local errors on Render
                return await remotePromise;
            }
        } else {
            // Read: Try Remote first, fallback to Local only in Dev
            try {
                return await remotePool.query(sql, params);
            } catch (err) {
                if (!IS_PROD) {
                    console.warn('⚠️ Remote Read Failed, using Localhost fallback:', err.message);
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
            // Fallback for local dev only
            if (!IS_PROD) return await localPool.getConnection();
            throw err;
        }
    }
};

// Keep alive - both pools
setInterval(() => {
    remotePool.query('SELECT 1').catch(() => {});
    localPool.query('SELECT 1').catch(() => {});
}, 30000);

module.exports = db;

