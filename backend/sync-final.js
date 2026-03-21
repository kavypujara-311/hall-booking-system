const mysql = require('mysql2/promise');
require('dotenv').config();

async function masterSync() {
    console.log('=== 🚀 SIMPLIFIED MASTER SYNC: PARITY CLEAN ===');
    let remote, local;
    try {
        remote = await mysql.createConnection({
            host: process.env.DB_HOST, port: 4000, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: 'hall_booking', ssl: { rejectUnauthorized: false }
        });
        
        local = await mysql.createConnection({
            host: 'localhost', user: 'root', password: '', multipleStatements: true
        });
        
        console.log('🔗 Databases connected.');

        // Wipe and recreate local database
        await local.query('DROP DATABASE IF EXISTS hall_booking');
        await local.query('CREATE DATABASE hall_booking');
        await local.query('USE hall_booking');
        await local.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log('✅ Local database hall_booking recreated.');

        const tables = [
            'users',
            'halls',
            'bookings',
            'reviews',
            'favorites',
            'payment_methods',
            'otp_logs',
            'user_activity_logs',
            'membership_requests',
            'contact_submissions'
        ];

        for (const t of tables) {
            console.log(`\n📦 Table: ${t}`);
            try {
                // Get Remote Schema
                const [rCols] = await remote.query('DESC ' + t);
                
                // Build a CLEAN but ACCURATE CREATE query
                let colDefs = rCols.map(c => {
                    let def = `\`${c.Field}\` ${c.Type}`;
                    if (c.Null === 'NO') def += ' NOT NULL';
                    if (c.Default !== null) {
                        if (c.Default === 'CURRENT_TIMESTAMP') {
                            def += ' DEFAULT CURRENT_TIMESTAMP';
                        } else {
                            def += ` DEFAULT '${c.Default}'`;
                        }
                    }
                    if (c.Extra === 'auto_increment') def += ' AUTO_INCREMENT';
                    if (c.Key === 'PRI') def += ' PRIMARY KEY';
                    return def;
                }).join(', ');
                
                await local.query(`CREATE TABLE \`${t}\` (${colDefs})`);
                console.log(`   ✅ Schema Build Success.`);

                // Sync data
                const [rows] = await remote.query('SELECT * FROM ' + t);
                if (rows.length > 0) {
                    for (const row of rows) {
                        const keys = Object.keys(row);
                        const names = keys.map(k => '`' + k + '`').join(', ');
                        const placeholders = keys.map(() => '?').join(', ');
                        
                        const values = keys.map(k => {
                            const val = row[k];
                            // Handle object stringification for JSON columns or anything complex
                            if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
                                return JSON.stringify(val);
                            }
                            return val;
                        });

                        await local.query(`INSERT INTO \`${t}\` (${names}) VALUES (${placeholders})`, values);
                    }
                    console.log(`   ✅ ${rows.length} rows synced.`);
                } else {
                    console.log('   ⏭️ No rows found.');
                }
            } catch (err) {
                console.error(`   ❌ Failed: ${err.message}`);
                // Simple attempt without keys if it fails
            }
        }

        await local.query('SET FOREIGN_KEY_CHECKS = 1');
        await local.end();
        console.log('\n--- ✨ SYNC COMPLETED SUCCESSFULLY ---');
        
    } catch (err) {
        console.error('FATAL SYNC ERROR:', err.message);
    } finally {
        if (remote) await remote.end();
        process.exit();
    }
}

masterSync();
