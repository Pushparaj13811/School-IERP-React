import { prisma } from '../databases/prismaClient.js';

const seedClassesAndSections = async () => {
    try {
        console.log('Starting to seed classes and sections...');

        // Create 10 classes
        for (let i = 1; i <= 10; i++) {
            const className = `Class ${i}`;
            console.log(`Creating ${className}...`);

            // Create class
            const newClass = await prisma.class.create({
                data: {
                    name: className
                }
            });

            // Create sections for each class (1-3 sections)
            const numberOfSections = Math.floor(Math.random() * 3) + 1; // Random number between 1 and 3
            const sections = ['A', 'B', 'C'];

            for (let j = 0; j < numberOfSections; j++) {
                const sectionName = sections[j];
                console.log(`Creating Section ${sectionName} for ${className}...`);

                await prisma.section.create({
                    data: {
                        name: sectionName,
                        classId: newClass.id
                    }
                });
            }
        }

        console.log('Successfully seeded classes and sections!');
    } catch (error) {
        console.error('Error seeding classes and sections:', error);
    } finally {
        await prisma.$disconnect();
    }
};

// Run the seeding function
seedClassesAndSections(); 