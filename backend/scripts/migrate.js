const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://autosathi_user:autosathi_password@localhost:5432/autosathi',
});

async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');

    // Read and execute init SQL
    const initPath = path.join(__dirname, '../database/init.sql');
    const initSQL = fs.readFileSync(initPath, 'utf8');

    await pool.query(initSQL);

    console.log('✅ Database migrations completed successfully!');
    console.log('📋 Created tables:');
    console.log('   - users');
    console.log('   - vehicles');
    console.log('   - insurance');
    console.log('   - puc');
    console.log('   - service_records');
    console.log('   - fuel_entries');
    console.log('   - notifications');
    console.log('   - documents');
    console.log('   - indexes and triggers');
  } catch (error) {
    console.error('❌ Error running migrations:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations if called directly
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };
