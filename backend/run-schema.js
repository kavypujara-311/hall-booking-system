const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
    console.log('Connecting to TiDB...');
    const connection = await mysql.createConnection({
        host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
        user: '3L5XjoEyrEmS4PU.root',
        password: 'MZpSTHXp37kDK6Sq',
        database: 'test',
        port: 4000,
        ssl: { rejectUnauthorized: false },
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
