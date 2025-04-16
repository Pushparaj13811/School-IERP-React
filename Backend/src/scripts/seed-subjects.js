import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed subjects...');

  // Define the subjects to be created
  const subjects = [
    {
      name: 'Mathematics',
      code: 'MATH',
      description: 'Study of numbers, quantities, and shapes'
    },
    {
      name: 'Science',
      code: 'SCI',
      description: 'Study of the natural world through observation and experiment'
    },
    {
      name: 'English',
      code: 'ENG',
      description: 'Study of English language, literature, and composition'
    },
    {
      name: 'Social Studies',
      code: 'SOC',
      description: 'Study of human society and social relationships'
    },
    {
      name: 'Computer Science',
      code: 'CS',
      description: 'Study of computers and computational systems'
    },
    {
      name: 'Physical Education',
      code: 'PE',
      description: 'Education in physical exercise, sports, and health'
    },
    {
      name: 'Art',
      code: 'ART',
      description: 'Study of creative expression through visual arts'
    },
    {
      name: 'Music',
      code: 'MUS',
      description: 'Study of musical theory, history, and performance'
    },
    {
      name: 'History',
      code: 'HIST',
      description: 'Study of past events and human affairs'
    },
    {
      name: 'Geography',
      code: 'GEO',
      description: 'Study of places and the relationships between people and their environments'
    },
    {
      name: 'Biology',
      code: 'BIO',
      description: 'Study of life and living organisms'
    },
    {
      name: 'Chemistry',
      code: 'CHEM',
      description: 'Study of the properties and behavior of matter'
    },
    {
      name: 'Physics',
      code: 'PHYS',
      description: 'Study of matter, energy, and their interactions'
    },
    {
      name: 'Economics',
      code: 'ECON',
      description: 'Study of how societies use scarce resources'
    },
    {
      name: 'Environmental Science',
      code: 'ENV',
      description: 'Study of the environment and human impacts on it'
    },
    {
      name: 'World Languages',
      code: 'LANG',
      description: 'Study of foreign languages and cultures'
    }
  ];

  // Create each subject, skipping if it already exists
  for (const subject of subjects) {
    const existingSubject = await prisma.subject.findUnique({
      where: { code: subject.code }
    });

    if (!existingSubject) {
      await prisma.subject.create({
        data: subject
      });
      console.log(`Created subject: ${subject.name} (${subject.code})`);
    } else {
      console.log(`Subject '${subject.name}' already exists, skipping...`);
    }
  }

  console.log('Subject seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding subjects:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 