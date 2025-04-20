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
  let createdSubjects = [];
  for (const subject of subjects) {
    const existingSubject = await prisma.subject.findUnique({
      where: { code: subject.code }
    });

    if (!existingSubject) {
      const newSubject = await prisma.subject.create({
        data: subject
      });
      console.log(`Created subject: ${subject.name} (${subject.code})`);
      createdSubjects.push(newSubject);
    } else {
      console.log(`Subject '${subject.name}' already exists, skipping...`);
      createdSubjects.push(existingSubject);
    }
  }

  // Fetch all classes
  console.log('Fetching classes...');
  const classes = await prisma.class.findMany();
  
  if (classes.length === 0) {
    console.log('No classes found. Please seed classes first.');
    return;
  }
  
  console.log(`Found ${classes.length} classes. Now assigning subjects to classes...`);

  // Assign subjects to classes based on their level
  // Define subject distributions by class level
  const classSubjectMappings = {
    // Elementary classes (1-5)
    elementary: ['MATH', 'ENG', 'SCI', 'SOC', 'PE', 'ART', 'MUS'],
    
    // Middle school classes (6-8)
    middleSchool: ['MATH', 'ENG', 'SCI', 'SOC', 'PE', 'ART', 'MUS', 'HIST', 'GEO', 'CS'],
    
    // High school classes (9-12)
    highSchool: ['MATH', 'ENG', 'BIO', 'CHEM', 'PHYS', 'HIST', 'GEO', 'CS', 'ECON', 'PE', 'ENV', 'LANG']
  };

  // Function to determine class level
  const getClassLevel = (className) => {
    const classNumber = parseInt(className.replace(/\D/g, ''));
    
    if (classNumber >= 1 && classNumber <= 5) {
      return 'elementary';
    } else if (classNumber >= 6 && classNumber <= 8) {
      return 'middleSchool';
    } else {
      return 'highSchool';
    }
  };

  // Create ClassSubject associations
  const classSubjectAssociations = [];
  
  for (const cls of classes) {
    const level = getClassLevel(cls.name);
    const subjectCodes = classSubjectMappings[level];
    
    for (const code of subjectCodes) {
      const subject = createdSubjects.find(s => s.code === code);
      
      if (subject) {
        // Check if association already exists
        const existingAssociation = await prisma.classSubject.findFirst({
          where: {
            classId: cls.id,
            subjectId: subject.id
          }
        });
        
        if (!existingAssociation) {
          classSubjectAssociations.push({
            classId: cls.id,
            subjectId: subject.id
          });
        }
      }
    }
  }
  
  // Batch create class-subject associations
  if (classSubjectAssociations.length > 0) {
    await prisma.classSubject.createMany({
      data: classSubjectAssociations,
      skipDuplicates: true
    });
    
    console.log(`Created ${classSubjectAssociations.length} class-subject associations`);
  } else {
    console.log('No new class-subject associations to create');
  }

  console.log('Subject seeding and class assignments completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding subjects:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 