import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed designations...');

  // Define the designations to be created
  const designations = [
    {
      name: 'Principal',
      description: 'Head of the school responsible for overall management and leadership'
    },
    {
      name: 'Vice Principal',
      description: 'Assists the principal in administrative duties and school management'
    },
    {
      name: 'Head of Department',
      description: 'Responsible for curriculum and teaching staff in a specific subject area'
    },
    {
      name: 'Senior Teacher',
      description: 'Experienced teacher with additional responsibilities in mentoring and curriculum'
    },
    {
      name: 'Class Teacher',
      description: 'Primary teacher responsible for a specific class of students'
    },
    {
      name: 'Subject Teacher',
      description: 'Teacher specialized in teaching a specific subject'
    },
    {
      name: 'Coordinator',
      description: 'Responsible for coordinating specific school activities or programs'
    },
    {
      name: 'Counselor',
      description: 'Provides guidance and counseling to students'
    },
    {
      name: 'Special Education Teacher',
      description: 'Specialized in teaching students with special needs'
    },
    {
      name: 'Librarian',
      description: 'Manages the school library and resources'
    },
    {
      name: 'Computer Teacher',
      description: 'Teaches computer science and manages IT resources'
    },
    {
      name: 'Physical Education Teacher',
      description: 'Teaches physical education and coordinates sports activities'
    }
  ];

  // Create each designation, skipping if it already exists
  for (const designation of designations) {
    const existingDesignation = await prisma.designation.findUnique({
      where: { name: designation.name }
    });

    if (!existingDesignation) {
      await prisma.designation.create({
        data: designation
      });
      console.log(`Created designation: ${designation.name}`);
    } else {
      console.log(`Designation '${designation.name}' already exists, skipping...`);
    }
  }

  console.log('Designation seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding designations:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 