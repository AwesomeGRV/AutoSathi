const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://autosathi_user:autosathi_password@localhost:5432/autosathi',
});

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Read and execute seed SQL
    const seedPath = path.join(__dirname, '../database/seed.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');

    await pool.query(seedSQL);

    console.log('✅ Database seeded successfully!');
    console.log('📊 Sample data includes:');
    console.log('   - 3 sample users (2 regular, 1 admin)');
    console.log('   - 4 sample vehicles');
    console.log('   - Insurance policies');
    console.log('   - PUC certificates');
    console.log('   - Service records');
    console.log('   - Fuel entries');
    console.log('   - Documents');
    console.log('   - Notifications');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
