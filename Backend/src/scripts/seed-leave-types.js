import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed leave types...');

  // Define the leave types to be created
  const leaveTypes = [
    {
      name: 'Sick Leave',
      description: 'Leave due to illness or medical conditions requiring rest or treatment'
    },
    {
      name: 'Personal Leave',
      description: 'Leave for personal matters or emergencies'
    },
    {
      name: 'Family Emergency',
      description: 'Leave to attend to urgent family matters or emergencies'
    },
    {
      name: 'Medical Leave',
      description: 'Leave for scheduled medical procedures, doctor appointments, or recovery'
    },
    {
      name: 'Academic Leave',
      description: 'Leave for academic-related activities like competitions, conferences or workshops'
    },
    {
      name: 'Religious Leave',
      description: 'Leave for religious observances, festivals, or ceremonies'
    },
    {
      name: 'Bereavement Leave',
      description: 'Leave due to the death of a family member or close relative'
    },
    {
      name: 'Sports Leave',
      description: 'Leave for participating in sports events or competitions'
    },
    {
      name: 'Cultural Leave',
      description: 'Leave for participating in cultural events, performances, or festivals'
    },
    {
      name: 'Exam Preparation Leave',
      description: 'Leave granted for preparation before important examinations'
    }
  ];

  // Create each leave type, skipping if it already exists
  for (const leaveType of leaveTypes) {
    const existingLeaveType = await prisma.leaveType.findUnique({
      where: { name: leaveType.name }
    });

    if (!existingLeaveType) {
      await prisma.leaveType.create({
        data: leaveType
      });
      console.log(`Created leave type: ${leaveType.name}`);
    } else {
      console.log(`Leave type '${leaveType.name}' already exists, skipping...`);
    }
  }

  console.log('Leave type seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding leave types:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 