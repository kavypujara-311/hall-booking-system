const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

async function seed() {
    console.log('🌱 Starting Database Seed...');

    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306,
        multipleStatements: true, // Important for running the schema file
        ssl: process.env.DB_SSL === 'true' ? { minVersion: 'TLSv1.2', rejectUnauthorized: false } : undefined
    };

    let connection;

    try {
        // Connect without database selected first, to allow DROP DATABASE
        connection = await mysql.createConnection(config);
        console.log('✅ Connected to MySQL server');

        // Read schema file
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');
        console.log(`📄 Read schema file from ${schemaPath}`);

        // Execute schema
        console.log('⏳ Executing schema (this may take a moment)...');
        await connection.query(sql);
        console.log('✅ Schema executed successfully!');

        console.log('🎉 Database has been reset and halls populated from schema.');



    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('👋 Connection closed');
        }
        process.exit();
    }
}

seed();
