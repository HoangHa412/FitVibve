const pool = require('./BE/config/db');

async function run() {
    try {
        await pool.query('ALTER TABLE routes ADD COLUMN standard VARCHAR(255) DEFAULT \'Chưa xác định\'');
        console.log('Added standard to routes');
    } catch(e) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log('Field standard already exists.');
        else console.log(e.message);
    }
    
    try {
        await pool.query('ALTER TABLE route_stages ADD COLUMN nutrition_plan TEXT NULL');
        console.log('Added nutrition_plan to route_stages');
    } catch(e) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log('Field nutrition_plan already exists.');
        else console.log(e.message);
    }
    
    try {
        await pool.query('ALTER TABLE route_stages ADD COLUMN calories_target INT DEFAULT 0');
        console.log('Added calories_target to route_stages');
    } catch(e) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log('Field calories_target already exists.');
        else console.log(e.message);
    }
    
    process.exit(0);
}

run();
