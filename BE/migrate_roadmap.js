const pool = require('./config/db');

async function check() {
    try {
        const [tables] = await pool.query("SHOW TABLES");
        console.log(tables);
    } catch (e) {
        console.error(e);
    } finally {
        process.exit();
    }
}

check();
