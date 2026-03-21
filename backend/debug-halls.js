const mysql = require('mysql2/promise');
require('dotenv').config();

async function syncHalls() {
    console.log('--- 🚀 DEBUG SYNC: Halls Table Only ---');
    let remote, local;
    try {
        remote = await mysql.createConnection({
            host: process.env.DB_HOST, port: 4000, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: 'hall_booking', ssl: { rejectUnauthorized: false }
        });
        local = await mysql.createConnection({
            host: 'localhost', user: 'root', password: '', database: 'hall_booking'
        });

        // Sync Schema
        const [rSchema] = await remote.query('SHOW CREATE TABLE halls');
        let createSql = rSchema[0]['Create Table'].replace(/\/\*T!\[clustered_index\].*?\*\//g, '');
        await local.query('DROP TABLE IF EXISTS halls');
        await local.query(createSql);
        console.log('✅ Local halls table recreated.');

        // Sync Data
        const [remoteRows] = await remote.query('SELECT * FROM halls');
        console.log(`Found ${remoteRows.length} rows in Cloud.`);

        for (let i = 0; i < remoteRows.length; i++) {
            const row = remoteRows[i];
            const keys = Object.keys(row);
            const names = keys.map(k => '`' + k + '`').join(', ');
            const placeholders = keys.map(() => '?').join(', ');
            const values = keys.map(k => row[k]);

            try {
                await local.query(`INSERT INTO halls (${names}) VALUES (${placeholders})`, values);
            } catch (err) {
                console.error(`❌ Row ${i + 1} Failed:`, err.message);
                // Log column count difference
                console.log(`Col count: ${keys.length}, Value count: ${values.length}`);
            }
        }
        console.log('--- 🚀 DONE ---');
    } catch (e) {
        console.error('Fatal Er:', e.message);
    } finally {
        if (remote) await remote.end();
        if (local) await local.end();
        process.exit();
    }
}

syncHalls();
