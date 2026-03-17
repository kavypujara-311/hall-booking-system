const pool = require('./config/db');

async function update() {
    try {
        await pool.query("UPDATE users SET membership_tier = 'gold' WHERE email IN ('23030401118@darshan.ac.in', 'kavypujara81@gmail.com')");
        console.log('✅ Users updated to GOLD tier');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

update();
