const bcrypt = require('bcryptjs');
const { pool } = require('./database');

async function testAdmin() {
    try {
        const res = await pool.query('SELECT * FROM admins WHERE email = $1', ['admin@geodataar.com']);

        if (res.rows[0]) {
            const admin = res.rows[0];
            console.log('✓ Admin found:', admin.email);
            console.log('Password hash in DB:', admin.password);

            const testPassword = 'admin123';
            const isValid = bcrypt.compareSync(testPassword, admin.password);

            console.log('\n--- Password Test ---');
            console.log('Testing password "admin123":', isValid ? '✓ VALID' : '✗ INVALID');

            if (!isValid) {
                console.log('\n⚠️  The password "admin123" does NOT match the hash in database!');
                console.log('Possible reasons:');
                console.log('1. Password was changed');
                console.log('2. Database was corrupted');
                console.log('3. Hash algorithm mismatch');
            }
        } else {
            console.log('✗ Admin not found in database!');
        }

        pool.end();
    } catch (err) {
        console.error('Error:', err.message);
        pool.end();
    }
}

testAdmin();
