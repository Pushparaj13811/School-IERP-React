import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const grades = [
  {
    grade: 'A+',
    minScore: 90,
    maxScore: 100,
    description: 'Outstanding'
  },
  {
    grade: 'A',
    minScore: 80,
    maxScore: 89.99,
    description: 'Excellent'
  },
  {
    grade: 'B+',
    minScore: 70,
    maxScore: 79.99,
    description: 'Very Good'
  },
  {
    grade: 'B',
    minScore: 60,
    maxScore: 69.99,
    description: 'Good'
  },
  {
    grade: 'C+',
    minScore: 50,
    maxScore: 59.99,
    description: 'Above Average'
  },
  {
    grade: 'C',
    minScore: 40,
    maxScore: 49.99,
    description: 'Average'
  },
  {
    grade: 'F',
    minScore: 0,
    maxScore: 39.99,
    description: 'Fail'
  }
];

async function main() {
  console.log('🌱 Seeding grade definitions...');

  // Delete existing grade definitions
  try {
    await prisma.gradeDefinition.deleteMany();
    console.log('Cleared existing grade definitions');
  } catch (error) {
    console.log('No existing grade definitions to clear');
  }

  // Create grade definitions
  for (const grade of grades) {
    await prisma.gradeDefinition.create({
      data: grade
    });
  }

  console.log('✅ Grade definitions seeded successfully');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 