import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createGradeDefinitions() {
  try {
    const gradeDefinitions = [
      { grade: 'A+', minScore: 90, maxScore: 100, description: 'Outstanding' },
      { grade: 'A', minScore: 80, maxScore: 89.99, description: 'Excellent' },
      { grade: 'B+', minScore: 70, maxScore: 79.99, description: 'Very Good' },
      { grade: 'B', minScore: 60, maxScore: 69.99, description: 'Good' },
      { grade: 'C+', minScore: 50, maxScore: 59.99, description: 'Satisfactory' },
      { grade: 'C', minScore: 40, maxScore: 49.99, description: 'Acceptable' },
      { grade: 'F', minScore: 0, maxScore: 39.99, description: 'Failed' },
    ];

    for (const definition of gradeDefinitions) {
      // Check if the grade already exists
      const existing = await prisma.gradeDefinition.findFirst({
        where: { grade: definition.grade }
      });

      if (!existing) {
        await prisma.gradeDefinition.create({ data: definition });
        console.log(`Created grade definition: ${definition.grade}`);
      } else {
        console.log(`Grade ${definition.grade} already exists with ID: ${existing.id}`);
      }
    }

    console.log('Grade definitions created successfully');
  } catch (error) {
    console.error('Error creating grade definitions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createGradeDefinitions(); 