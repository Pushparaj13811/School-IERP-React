// Script to seed teachers into the database
import seedTeachers from '../seeders/teacherSeeder.js';

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║                 TEACHER SEEDER SCRIPT                  ║');
console.log('╚════════════════════════════════════════════════════════╝');

console.log('\n📚 This script will seed 30 sample teachers into the database.');
console.log('\n⚠️  REQUIREMENTS:');
console.log('   - Designations must already be seeded');
console.log('   - Subjects must already be seeded');

console.log('\n🔍 ACTIONS:');
console.log('   - Creates user accounts with role TEACHER');
console.log('   - Default password: "password123"');
console.log('   - Randomly assigns designations');
console.log('   - Generates random contact information');

console.log('\n🚀 STARTING TEACHER SEEDING PROCESS...');

seedTeachers()
  .then(() => {
    console.log('\n✅ SUCCESS: Teachers successfully added to the database!');
    console.log('   Teachers can log in with their emails and password: "password123"');
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                 SEEDING COMPLETED                      ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ ERROR: Failed to seed teachers');
    console.error('   Details:', error.message);
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║                 SEEDING FAILED                         ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    process.exit(1);
  }); 