const pool = require('./config/db');

async function check() {
    try {
        const [users] = await pool.query('SELECT id, name, email, role, membership_tier FROM users');
        console.log(JSON.stringify(users, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
