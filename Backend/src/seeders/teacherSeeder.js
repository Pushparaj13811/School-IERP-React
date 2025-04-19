import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Seeds 30 teacher records with realistic data
 * - Creates user accounts with role TEACHER
 * - Assigns random designations
 * - Links teachers to appropriate subjects
 * - Generates random contact information
 */
const seedTeachers = async () => {
    try {
        // Get available designations for teachers
        const designations = await prisma.designation.findMany();

        if (designations.length === 0) {
            console.log('No designations found. Please seed designations first.');
            return;
        }

        // Get available subjects
        const subjects = await prisma.subject.findMany();
        if (subjects.length === 0) {
            console.log('No subjects found. Please seed subjects first.');
            return;
        }

        // Default password for all teachers
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Teacher data with subject specializations
        const teacherData = [
            {name: 'Pushpa Kumari Yadav', gender: 'FEMALE', email: 'pushpa.yadav@school.com', bio: 'Pushpa Kumari Yadav is a dedicated educator from Janakpur, known for her warm teaching style and deep understanding of mathematics.'},
            {name: 'Rajesh Kumar Singh', gender: 'MALE', email: 'rajesh.singh@school.com', bio: 'Rajesh Kumar Singh brings over 15 years of experience teaching science and is passionate about hands-on learning and innovation.'},
            {name: 'Sneha Patel', gender: 'FEMALE', email: 'sneha.patel@school.com', bio: 'Sneha Patel is an enthusiastic language teacher who loves integrating local stories into her Hindi lessons to engage students.'},
            {name: 'Aayush Shrestha', gender: 'MALE', email: 'aayush.shrestha@school.com', bio: 'Aayush Shrestha is a physics teacher from Pokhara, known for simplifying complex concepts and mentoring aspiring engineers.'},     
            {name: 'Nikita Mehta', gender: 'FEMALE', email: 'nikita.mehta@school.com', bio: 'Nikita Mehta teaches biology with a strong focus on environmental awareness and sustainable living practices.'},
            {name: 'Devendra Joshi', gender: 'MALE', email: 'devendra.joshi@school.com', bio: 'Devendra Joshi is a passionate history teacher who brings the past to life through storytelling and interactive activities.'},   
            {name: 'Pragya Sharma', gender: 'FEMALE', email: 'pragya.sharma@school.com', bio: 'Pragya Sharma specializes in early childhood education and is known for creating a joyful, inclusive classroom environment.'},
            {name: 'Binod Chaudhary', gender: 'MALE', email: 'binod.chaudhary@school.com', bio: 'Binod Chaudhary is a science teacher who brings hands-on experiments to life to make learning more engaging.'},
            {name: 'Anjali Nair', gender: 'FEMALE', email: 'anjali.nair@school.com', bio: 'Anjali Nair is a literature teacher who encourages critical thinking and creative expression through writing and drama.'},
            {name: 'Ramesh Bhandari', gender: 'MALE', email: 'ramesh.bhandari@school.com', bio: 'Ramesh Bhandari is a computer science teacher focused on teaching programming and digital literacy in rural communities.'},
            {name: 'Meena Gupta', gender: 'FEMALE', email: 'meena.gupta@school.com', bio: 'Meena Gupta fosters curiosity in young minds with her creative science experiments and patient mentoring.'},
            {name: 'Nabin Thapa', gender: 'MALE', email: 'nabin.thapa@school.com', bio: 'Nabin Thapa is a geography teacher who integrates local field trips and maps to connect theory with the real world.'},
            {name: 'Pooja Desai', gender: 'FEMALE', email: 'pooja.desai@school.com', bio: 'Pooja Desai is passionate about music education and leads the school choir with energy and enthusiasm.'},
            {name: 'Amit Mishra', gender: 'MALE', email: 'amit.mishra@school.com', bio: 'Amit Mishra is a math genius who helps students conquer fear of numbers with clarity and real-life applications.'},
            {name: 'Sunita Rai', gender: 'FEMALE', email: 'sunita.rai@school.com', bio: 'Sunita Rai focuses on moral education and guides students toward being responsible, empathetic citizens.'},
            {name: 'Pooja Desai', gender: 'FEMALE', email: 'pooja.desai@school.com', bio: 'Pooja Desai is passionate about music education and leads the school choir with energy and enthusiasm.'},
            {name: 'Amit Mishra', gender: 'MALE', email: 'amit.mishra@school.com', bio: 'Amit Mishra is a math genius who helps students conquer fear of numbers with clarity and real-life applications.'},
            {name: 'Sunita Rai', gender: 'FEMALE', email: 'sunita.rai@school.com', bio: 'Sunita Rai focuses on moral education and guides students toward being responsible, empathetic citizens.'},
            {name: 'Sagar Pandey',gender: 'MALE',email: 'sagar.pandey@school.com',bio: 'Sagar Pandey is a sports instructor who believes in the power of discipline, teamwork, and physical wellness in student life.'},
            {name: 'Kavita Reddy', gender: 'FEMALE', email: 'kavita.reddy@school.com', bio: 'Kavita Reddy is a passionate English teacher who inspires students to fall in love with reading and self-expression.'},
            {name: 'Deepak Verma', gender: 'MALE', email: 'deepak.verma@school.com', bio: 'Deepak Verma specializes in political science and enjoys organizing debates to help students build confidence and clarity.'},    
            {name: 'Manisha Tamang', gender: 'FEMALE', email: 'manisha.tamang@school.com', bio: 'Manisha Tamang teaches social studies with an emphasis on cultural understanding and community building.'},        
            {name: 'Ravi Kapoor', gender: 'MALE', email: 'ravi.kapoor@school.com', bio: 'Ravi Kapoor is known for his creative teaching techniques in mathematics and logical reasoning.'},
            {name: 'Aarti Sharma', gender: 'FEMALE', email: 'aarti.sharma@school.com', bio: 'Aarti Sharma is a veteran teacher in Sanskrit and believes in connecting language with ancient wisdom and values.'},
            {name: 'Krishna Bhattarai', gender: 'MALE', email: 'krishna.bhattarai@school.com', bio: 'Krishna Bhattarai teaches science with a special interest in astronomy and leads the school’s science club.'},
            {name: 'Neha Dubey', gender: 'FEMALE', email: 'neha.dubey@school.com', bio: 'Neha Dubey is a psychology teacher who creates a safe space for students to explore their thoughts and emotions.'},
            {name: 'Hari Prasad Pokharel', gender: 'MALE', email: 'hari.pokharel@school.com', bio: 'Hari Prasad Pokharel brings decades of experience teaching Nepali literature and poetry.'},
            {name: 'Reema Koirala', gender: 'FEMALE', email: 'reema.koirala@school.com', bio: 'Reema Koirala is an art teacher who helps students explore their creativity through painting and design.'},
            {name: 'Anand Iyer', gender: 'MALE', email: 'anand.iyer@school.com', bio: 'Anand Iyer blends traditional and modern techniques to teach physics and ignite curiosity in his students.'  },
            {name: 'Bhavna Acharya', gender: 'FEMALE', email: 'bhavna.acharya@school.com', bio: 'Bhavna Acharya uses inclusive pedagogy to teach students from diverse backgrounds with empathy and patience.'},
            {name: 'Shyam Sundar Mishra', gender: 'MALE', email: 'shyam.mishra@school.com', bio: 'Shyam Sundar Mishra teaches Vedic math and promotes ancient techniques for mental calculation.'},
            {name: 'Meera Lama', gender: 'FEMALE', email: 'meera.lama@school.com', bio: 'Meera Lama is a dedicated kindergarten teacher who believes that learning through play builds strong foundations.'},
            {name: 'Niraj Jha', gender: 'MALE', email: 'niraj.jha@school.com', bio: 'Niraj Jha teaches philosophy and ethics, guiding students to think critically and act with integrity.'}
        ];


        // Generate a random phone number
        const generatePhone = () => {
            return `+977${Math.floor(980000000 + Math.random() * 999999999)}`;
        };

        // Generate a random address
        const generateAddress = () => {
            const streets = ['Main Street', 'Putalisadak', 'Baluwatar', 'Swayambhu', 'Baghjoda', 'Koteshwor', 'Kirtipur', 'Koteshwor'];
            const cities = ['Kathmandu', 'Pokhara', 'Biratnagar', 'Birgunj', 'Dharan', 'Bhaktapur', 'Lalitpur'];
            const districts = ['Kathmandu', 'Kaski', 'Lalitpur', 'Bhaktapur', 'Lalitpur', "Sunsari", "Morang", "Jhapa", "Saptari", "Siraha", "Dhanusha", "Mahottari", "Saptari", "Siraha", "Dhanusha", "Mahottari", "Sarlahi", "Rauthat", "Saptari", "Siraha", "Dhanusha", "Mahottari", "Sarlahi", "Rauthat", "Sarlahi"];
            const states = ['Bagmati', 'Lumbini', 'Bheri', 'Karnali', 'Dhawalagiri', 'Gandaki', 'Janakpur'];
            const street = `${Math.floor(100 + Math.random() * 9900)} ${streets[Math.floor(Math.random() * streets.length)]}`;
            const city = cities[Math.floor(Math.random() * cities.length)];
            const state = states[Math.floor(Math.random() * states.length)];
            const district = districts[Math.floor(Math.random() * districts.length)];
            const zip = Math.floor(10000 + Math.random() * 90000);
            return `${street}, ${city}, ${state}, ${district}, ${zip}`;
        };

        // Seed teachers
        let teachersCreated = 0;

        for (const teacher of teacherData) {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({
                where: { email: teacher.email }
            });

            if (existingUser) {
                console.log(`Teacher with email ${teacher.email} already exists, skipping...`);
                continue;
            }

            // Get random designation
            const randomDesignation = designations[Math.floor(Math.random() * designations.length)];
            const randomAddress = generateAddress();
            const address = randomAddress.split(',');
            const street = address[0];
            const city = address[1];
            const state = address[2];
            const district = address[3];

            // Create user with teacher role
            const user = await prisma.user.create({
                data: {
                    email: teacher.email,
                    password: hashedPassword,
                    role: 'TEACHER',
                    teacher: {
                        create: {
                            name: teacher.name,
                            gender: teacher.gender,
                            email: teacher.email,
                            bio: teacher.bio,
                            contactNo: generatePhone(),
                            emergencyContact: generatePhone(),
                            dateOfBirth: new Date(1980 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                            joinDate: new Date(2015 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
                            designation: {
                                connect: {
                                    id: randomDesignation.id
                                }
                            },
                            address: {
                                create: {
                                    addressLine1: randomAddress,
                                    street: street,
                                    city: city,
                                    ward: String(Math.floor(1 + Math.random() * 20)),
                                    municipality: city,
                                    district: district,
                                    province: state,
                                    country: "Nepal"
                                }
                            },
                        }
                    }
                },
                include: {
                    teacher: {
                    }
                }
            });

            console.log(`Created teacher: ${teacher.name}`);
            teachersCreated++;
        }

        console.log(`Successfully seeded ${teachersCreated} teachers`);

    } catch (error) {
        console.error('Error seeding teachers:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
};

export default seedTeachers; 