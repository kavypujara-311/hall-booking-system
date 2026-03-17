const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'test',
        port: parseInt(process.env.DB_PORT) || 3306,
        ssl: (process.env.DB_SSL === 'true') ? { rejectUnauthorized: false } : undefined,
        multipleStatements: true
    });

    try {
        let sql = fs.readFileSync(path.join(__dirname, 'database', 'schema.sql'), 'utf8');
        // Remove database creation logic
        sql = sql.replace(/DROP DATABASE IF EXISTS.*?;/i, '');
        sql = sql.replace(/CREATE DATABASE.*?;/i, '');
        sql = sql.replace(/USE .*?;/i, '');

        console.log('Running schema...');
        await connection.query(sql);
        console.log('Successfully created tables!');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await connection.end();
    }
}

run();
