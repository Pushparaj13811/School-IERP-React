import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs'; // Note: using bcryptjs to match the package.json

const prisma = new PrismaClient();

// Nepali first names (mix of male and female)
const nepaliFirstNames = [
  'Aarav', 'Arjun', 'Aditya', 'Anish', 'Ashish', 'Bikash', 'Binod', 'Bishnu',
  'Deepak', 'Dhiraj', 'Gagan', 'Gopal', 'Hari', 'Himal', 'Ishan', 'Kiran',
  'Krishna', 'Kumar', 'Lalit', 'Mahesh', 'Nabin', 'Niraj', 'Om', 'Prabesh',
  'Prakash', 'Prashant', 'Ramesh', 'Rajan', 'Rajesh', 'Rakesh', 'Rohan', 'Sabin',
  'Sachin', 'Sagar', 'Santosh', 'Saroj', 'Shiva', 'Sudeep', 'Sujan', 'Sunil',
  'Sushant', 'Ujjwal', 'Yogesh',
  // Female names
  'Aarti', 'Aasha', 'Amrita', 'Anita', 'Anjali', 'Apsara', 'Archana', 'Barsha',
  'Bhawana', 'Bimala', 'Deepa', 'Diksha', 'Ganga', 'Gita', 'Jamuna', 'Jyoti',
  'Kabita', 'Kamala', 'Kalpana', 'Karuna', 'Lakshmi', 'Laxmi', 'Manju', 'Maya',
  'Menuka', 'Nirmala', 'Parbati', 'Pooja', 'Pratima', 'Preeti', 'Priya', 'Radha',
  'Rekha', 'Renuka', 'Rita', 'Sabina', 'Sabitri', 'Samjhana', 'Sangita', 'Sapana',
  'Saraswati', 'Sarmila', 'Sarita', 'Shanti', 'Sita', 'Srijana', 'Sunita', 'Sushmita',
  'Tara', 'Uma'
];

// Nepali last names
const nepaliLastNames = [
  'Adhikari', 'Acharya', 'Aryal', 'Basnet', 'Bhandari', 'Bhattarai', 'Chhetri',
  'Dahal', 'Dhakal', 'Gautam', 'Ghimire', 'Giri', 'Gurung', 'Hamal', 'Joshi',
  'Karki', 'Khadka', 'Koirala', 'KC', 'Lamichhane', 'Limbu', 'Magar', 'Maharjan',
  'Niroula', 'Nepal', 'Oli', 'Pandey', 'Panta', 'Pokharel', 'Poudel', 'Pradhan',
  'Rai', 'Rana', 'Regmi', 'Rijal', 'Shah', 'Shakya', 'Sharma', 'Shrestha',
  'Subedi', 'Tamang', 'Thapa', 'Yadav'
];

// Nepali cities
const nepaliCities = [
  'Kathmandu', 'Pokhara', 'Lalitpur', 'Bhaktapur', 'Biratnagar',
  'Birgunj', 'Dharan', 'Nepalgunj', 'Butwal', 'Dhangadhi',
  'Itahari', 'Janakpur', 'Hetauda', 'Bharatpur', 'Tulsipur'
];

// Nepali districts
const nepaliDistricts = [
  'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kavre', 'Morang',
  'Sunsari', 'Jhapa', 'Ilam', 'Dhankuta', 'Chitwan',
  'Parsa', 'Bara', 'Makwanpur', 'Kaski', 'Syangja',
  'Palpa', 'Rupandehi', 'Dang', 'Banke', 'Bardiya',
  'Kailali', 'Kanchanpur', 'Dadeldhura', 'Baitadi', 'Darchula'
];

// Nepali provinces
const nepaliProvinces = [
  'Koshi', 'Madhesh', 'Bagmati', 'Gandaki',
  'Lumbini', 'Karnali', 'Sudurpashchim'
];

// Generate a random date of birth for students (between 5-18 years old)
function generateDateOfBirth() {
  const currentYear = new Date().getFullYear();
  const age = Math.floor(Math.random() * 13) + 5; // 5-18 years old
  const year = currentYear - age;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1; // Avoiding edge cases with month lengths
  return new Date(year, month - 1, day);
}

// Generate a random address
function generateAddress() {
  const city = nepaliCities[Math.floor(Math.random() * nepaliCities.length)];
  const district = nepaliDistricts[Math.floor(Math.random() * nepaliDistricts.length)];
  const province = nepaliProvinces[Math.floor(Math.random() * nepaliProvinces.length)];
  const ward = Math.floor(Math.random() * 30) + 1; // Wards 1-30

  return {
    addressLine1: `Ward-${ward}`,
    addressLine2: null,
    street: `${city} Marg`,
    city,
    ward: ward.toString(),
    municipality: `${city} Municipality`,
    district,
    province,
    country: 'Nepal',
    postalCode: (44600 + Math.floor(Math.random() * 400)).toString(),
    isPermanent: Math.random() > 0.3, // 70% chance it's permanent
  };
}

// Generate a random gender
function generateGender() {
  return Math.random() > 0.5 ? 'MALE' : 'FEMALE';
}

// Generate a random name based on gender
function generateName(gender) {
  let firstName;
  if (gender === 'MALE') {
    // Select from first 43 names (male names)
    firstName = nepaliFirstNames[Math.floor(Math.random() * 43)];
  } else {
    // Select from names starting from index 43 (female names)
    firstName = nepaliFirstNames[43 + Math.floor(Math.random() * (nepaliFirstNames.length - 43))];
  }
  const lastName = nepaliLastNames[Math.floor(Math.random() * nepaliLastNames.length)];
  return {
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`
  };
}

// Generate a random phone number
function generatePhoneNumber() {
  return `98${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
}

// Generate a random email based on name
function generateEmail(firstName, lastName) {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${Math.floor(Math.random() * 1000)}@${domain}`;
}

// Hash a password
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log('🌱 Starting seeding...');

  // Check if classes exist, if not create classes from 1-12
  const existingClassesCount = await prisma.class.count();
  if (existingClassesCount === 0) {
    console.log('Creating classes 1-12...');
    for (let i = 1; i <= 12; i++) {
      await prisma.class.create({
        data: {
          name: `Class ${i}`,
        },
      });
    }
  }

  // Get all classes
  const classes = await prisma.class.findMany();
  console.log(`Found ${classes.length} classes`);

  // For each class, check if sections exist, if not create sections A, B, C
  for (const cls of classes) {
    const sectionCount = await prisma.section.count({
      where: { classId: cls.id },
    });

    if (sectionCount === 0) {
      console.log(`Creating sections for class ${cls.name}...`);
      for (const sectionName of ['A', 'B', 'C']) {
        await prisma.section.create({
          data: {
            name: sectionName,
            classId: cls.id,
          },
        });
      }
    }
  }

  // Get all sections
  const sections = await prisma.section.findMany({
    include: { class: true },
  });
  console.log(`Found ${sections.length} sections across all classes`);

  // Create parents pool (to be assigned to students)
  const parentCount = await prisma.parent.count();
  const parentsNeeded = 50; // Create a pool of parents
  const parents = [];

  if (parentCount < parentsNeeded) {
    console.log(`Creating ${parentsNeeded} parents...`);
    for (let i = 0; i < parentsNeeded; i++) {
      const gender = generateGender();
      const { firstName, lastName, fullName } = generateName(gender);
      const email = generateEmail(firstName, lastName);
      const hashedPassword = await hashPassword('password123');

      // Create parent user
      const parentUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'PARENT',
        },
      });

      // Create parent address
      const parentAddress = await prisma.address.create({
        data: generateAddress(),
      });

      // Create parent
      const parent = await prisma.parent.create({
        data: {
          name: fullName,
          gender,
          email,
          contactNo: generatePhoneNumber(),
          userId: parentUser.id,
          addressId: parentAddress.id,
        },
      });

      parents.push(parent);
    }
  } else {
    console.log('Using existing parents...');
    parents.push(...await prisma.parent.findMany({ take: parentsNeeded }));
  }

  // Seed students for each section
  for (const section of sections) {
    // Check existing students in this section
    const existingStudents = await prisma.student.count({
      where: {
        classId: section.classId,
        sectionId: section.id,
      },
    });

    // Determine how many students to create (15-25 total)
    const studentsToCreate = Math.max(0, Math.floor(Math.random() * 11) + 15 - existingStudents);

    if (studentsToCreate > 0) {
      console.log(`Creating ${studentsToCreate} students for ${section.class.name} ${section.name}...`);

      // Create students with their relationships
      for (let i = 0; i < studentsToCreate; i++) {
        const gender = generateGender();
        const { firstName, lastName, fullName } = generateName(gender);
        const email = generateEmail(firstName, lastName);
        const hashedPassword = await hashPassword('password123');
        const dateOfBirth = generateDateOfBirth();

        try {
          // 1. Create student user
          const studentUser = await prisma.user.create({
            data: {
              email,
              password: hashedPassword,
              role: 'STUDENT',
            },
          });

          // 2. Create student address
          const studentAddress = await prisma.address.create({
            data: generateAddress(),
          });

          // 3. Get a random parent (80% chance to have a parent)
          const hasParent = Math.random() < 0.8;
          const parentId = hasParent ? parents[Math.floor(Math.random() * parents.length)].id : null;

          // 4. Create student
          await prisma.student.create({
            data: {
              name: fullName,
              nameAsPerBirth: fullName,
              gender,
              email,
              contactNo: generatePhoneNumber(),
              emergencyContact: generatePhoneNumber(),
              dateOfBirth,
              bloodGroup: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'][Math.floor(Math.random() * 8)],
              nationality: 'Nepali',
              religion: ['Hindu', 'Buddhist', 'Muslim', 'Christian', 'Kirat'][Math.floor(Math.random() * 5)],
              rollNo: `${section.class.name.replace('Class ', '')}-${section.name}-${i + 1 + existingStudents}`.padStart(8, '0'),
              fatherName: `${nepaliFirstNames[Math.floor(Math.random() * 43)]} ${lastName}`,
              motherName: `${nepaliFirstNames[43 + Math.floor(Math.random() * (nepaliFirstNames.length - 43))]} ${lastName}`,
              userId: studentUser.id,
              classId: section.classId,
              sectionId: section.id,
              parentId,
              addressId: studentAddress.id,
            },
          });
        } catch (error) {
          console.error(`Error creating student ${fullName}:`, error);
        }
      }
    } else {
      console.log(`${section.class.name} ${section.name} already has ${existingStudents} students (target: 15-25).`);
    }
  }

  console.log('✅ Seeding completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    // Close Prisma client
    await prisma.$disconnect();
  }); 