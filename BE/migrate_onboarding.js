const pool = require('./config/db');

async function migrate() {
    try {
        const connection = await pool.getConnection();
        
        console.log('Adding body_fat and medical_history to profiles table...');
        
        // Add body_fat if not exists
        try {
            await connection.query(`ALTER TABLE profiles ADD COLUMN body_fat FLOAT DEFAULT NULL`);
            console.log('Added body_fat column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('body_fat column already exists.');
            } else {
                throw e;
            }
        }

        // Add medical_history if not exists
        try {
            await connection.query(`ALTER TABLE profiles ADD COLUMN medical_history JSON DEFAULT NULL`);
            console.log('Added medical_history column.');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('medical_history column already exists.');
            } else {
                throw e;
            }
        }
        
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
