const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function forceSync() {
    console.log('=== FORCE SYNC: Copy ALL data from TiDB → Local ===\n');

    const remote = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT) || 4000,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'hall_booking',
        ssl: { rejectUnauthorized: false },
        connectTimeout: 15000
    });

    const local = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'hall_booking',
        connectTimeout: 5000
    });

    // Disable ALL constraints
    await local.query('SET FOREIGN_KEY_CHECKS = 0');
    await local.query('SET UNIQUE_CHECKS = 0');

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

    for (const table of tables) {
        try {
            const [remoteRows] = await remote.query(`SELECT * FROM ${table}`);
            
            // Wipe local table completely
            await local.query(`DELETE FROM ${table}`);

            if (remoteRows.length === 0) {
                console.log(`⏭️  ${table}: empty on remote, cleared local too`);
                continue;
            }

            // Insert each row
            let inserted = 0;
            for (const row of remoteRows) {
                const cols = Object.keys(row);
                const colNames = cols.map(c => '`' + c + '`').join(', ');
                const placeholders = cols.map(() => '?').join(', ');
                const values = cols.map(c => row[c]);

                await local.query(`INSERT INTO ${table} (${colNames}) VALUES (${placeholders})`, values);
                inserted++;
            }
            console.log(`✅ ${table}: ${inserted} rows copied`);
        } catch (e) {
            console.error(`❌ ${table}: ${e.message}`);
        }
    }

    await local.query('SET FOREIGN_KEY_CHECKS = 1');
    await local.query('SET UNIQUE_CHECKS = 1');

    // Verify
    console.log('\n--- VERIFICATION ---');
    for (const table of tables) {
        const [r] = await remote.query(`SELECT COUNT(*) as c FROM ${table}`);
        const [l] = await local.query(`SELECT COUNT(*) as c FROM ${table}`);
        const ok = r[0].c === l[0].c ? '✅' : '❌';
        console.log(`${ok} ${table}: Remote=${r[0].c} | Local=${l[0].c}`);
    }

    await remote.end();
    await local.end();
    console.log('\n=== ALL DATA SYNCED ===');
    process.exit(0);
}

forceSync().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
