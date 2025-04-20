import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting holiday seeder...');

  // Define holiday types
  const holidayTypes = [
    {
      name: 'Public Holiday',
      description: 'Government declared public holidays',
      color: '#C32232'
    },
    {
      name: 'School Function',
      description: 'Holidays for school functions and events',
      color: '#346751'
    },
    {
      name: 'Seasonal Break',
      description: 'Extended break periods during seasons',
      color: '#FF8427'
    },
    {
      name: 'Religious Holiday',
      description: 'Holidays for religious observances',
      color: '#7952B3'
    },
    {
      name: 'School Admin',
      description: 'Administrative days off set by school',
      color: '#1E88E5'
    }
  ];

  // Create holiday types
  console.log('Creating holiday types...');
  for (const type of holidayTypes) {
    await prisma.holidayType.upsert({
      where: { name: type.name },
      update: {},
      create: type
    });
  }
  console.log('Holiday types created successfully');

  // Get the created types to use their IDs
  const createdTypes = await prisma.holidayType.findMany();
  const typeMap = {};
  createdTypes.forEach(type => {
    typeMap[type.name] = type.id;
  });

  // Define holidays
  const holidays = [
    {
      name: 'Holi 2nd Day - Dhuleti',
      description: 'The second day of Holi festival, known as Dhuleti, is celebrated with colored powders and water, symbolizing the arrival of spring and the victory of good over evil.',
      fromDate: new Date('2025-03-14'),
      toDate: new Date('2025-03-14'),
      holidayTypeId: typeMap['Religious Holiday'],
      isRecurring: true,
      recurrencePattern: 'yearly'
    },
    {
      name: '3rd Saturday Holiday',
      description: 'A regular holiday occurring on the third Saturday of the month as per the school calendar.',
      fromDate: new Date('2025-03-15'),
      toDate: new Date('2025-03-15'),
      holidayTypeId: typeMap['School Admin'],
      isRecurring: true,
      recurrencePattern: 'monthly'
    },
    {
      name: 'Ramzan-Id',
      description: 'Ramzan-Id marks the end of Ramadan, the Islamic holy month of fasting. It\'s a day of feasting, prayer, and celebration for Muslims worldwide.',
      fromDate: new Date('2025-03-31'),
      toDate: new Date('2025-03-31'),
      holidayTypeId: typeMap['Religious Holiday'],
      isRecurring: true,
      recurrencePattern: 'yearly'
    },
    {
      name: 'Shree Ram Navami',
      description: 'Ram Navami celebrates the birth of Lord Rama, the seventh avatar of Vishnu. The festival honors his life, teachings, and his victory of good over evil.',
      fromDate: new Date('2025-04-06'),
      toDate: new Date('2025-04-06'),
      holidayTypeId: typeMap['Religious Holiday'],
      isRecurring: true,
      recurrencePattern: 'yearly'
    },
    {
      name: 'Dr. Babasaheb Ambedkar\'s Jayanti',
      description: 'This day commemorates the birth anniversary of Dr. B.R. Ambedkar, the chief architect of the Indian Constitution and a prominent social reformer.',
      fromDate: new Date('2025-04-14'),
      toDate: new Date('2025-04-14'),
      holidayTypeId: typeMap['Public Holiday'],
      isRecurring: true,
      recurrencePattern: 'yearly'
    },
    {
      name: 'Raksha Bandhan',
      description: 'Raksha Bandhan is a Hindu festival celebrating the bond between brothers and sisters. Sisters tie a protective thread (rakhi) on their brothers\' wrists, receiving gifts and protection in return.',
      fromDate: new Date('2025-08-09'),
      toDate: new Date('2025-08-09'),
      holidayTypeId: typeMap['Religious Holiday'],
      isRecurring: true,
      recurrencePattern: 'yearly'
    },
    {
      name: 'Janmashtami',
      description: 'Janmashtami celebrates the birth of Lord Krishna, the eighth avatar of Vishnu. It is observed with devotional songs, dances, fasting, and night vigils.',
      fromDate: new Date('2025-08-14'),
      toDate: new Date('2025-08-20'),
      holidayTypeId: typeMap['Religious Holiday'],
      isRecurring: true,
      recurrencePattern: 'yearly'
    },
    {
      name: 'Independence Day',
      description: 'Independence Day commemorates India\'s independence from British rule on August 15, 1947. It\'s celebrated with flag hoisting, parades, and cultural programs across the country.',
      fromDate: new Date('2025-08-15'),
      toDate: new Date('2025-08-15'),
      holidayTypeId: typeMap['Public Holiday'],
      isRecurring: true,
      recurrencePattern: 'yearly'
    },
    {
      name: 'Gandhi Jayanti & Dussehra',
      description: 'This day marks both Gandhi Jayanti, the birth anniversary of Mahatma Gandhi, and Dussehra, which celebrates Lord Rama\'s victory over Ravana, symbolizing the triumph of good over evil.',
      fromDate: new Date('2025-10-02'),
      toDate: new Date('2025-10-02'),
      holidayTypeId: typeMap['Public Holiday'],
      isRecurring: true,
      recurrencePattern: 'yearly'
    },
    {
      name: 'Diwali Holiday',
      description: 'Diwali, the festival of lights, celebrates the victory of light over darkness and good over evil. The extended holiday period includes multiple celebrations like Dhanteras, Naraka Chaturdashi, Lakshmi Puja, and Bhai Dooj.',
      fromDate: new Date('2025-10-20'),
      toDate: new Date('2025-11-02'),
      holidayTypeId: typeMap['Seasonal Break'],
      isRecurring: true,
      recurrencePattern: 'yearly'
    },
    {
      name: 'Maha Shivratri',
      description: 'Maha Shivratri is a Hindu festival that honors the god Shiva and celebrates his marriage to Parvati. It\'s also a time to remember Shiva\'s cosmic dance, the tandava, and to overcome ignorance and darkness.',
      fromDate: new Date('2025-02-26'),
      toDate: new Date('2025-02-26'),
      holidayTypeId: typeMap['Religious Holiday'],
      isRecurring: true,
      recurrencePattern: 'yearly'
    }
  ];

  // Create holidays
  console.log('Creating holidays...');
  for (const holiday of holidays) {
    await prisma.holiday.upsert({
      where: { 
        fromDate_toDate_name: {
          fromDate: holiday.fromDate,
          toDate: holiday.toDate,
          name: holiday.name
        }
      },
      update: {},
      create: holiday
    });
  }
  console.log('Holidays created successfully');

  console.log('Holiday seeding completed successfully!');
}

main()
  .catch(e => {
    console.error('Error during holiday seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 