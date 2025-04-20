import { UserService } from '../services/userService.js';
import { AppError } from '../middlewares/errorHandler.js';
import { emailService } from '../services/emailService.js';
import { prisma } from '../databases/prismaClient.js';

const userService = new UserService();

const seedAdmin = async () => {
    try {
        // Check if admin already exists
        const existingAdmin = await userService.getUserByEmail('admin@school.com');
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        // Create admin user
        const adminData = {
            email: 'pushparajmehta002@gmail.com',
            role: 'ADMIN',
            admin: {
                create: {
                    email: 'pushparajmehta002@gmail.com',
                    fullName: 'System Admin',
                    phone: '9860000000',
                    dateOfBirth: new Date('1990-01-01'),
                    emergencyContact: '9876543210',
                    joinDate: new Date(),
                    bio: 'System Administrator',
                    address: {
                        create: {
                            addressLine1: 'School Address',
                            street: 'Main Street',
                            city: 'Kathmandu',
                            ward: '1',
                            municipality: 'Kathmandu Metropolitan City',
                            district: 'Kathmandu',
                            province: 'Bagmati',
                            country: 'Nepal',
                            isPermanent: true
                        }
                    }
                }
            }
        };

        const { user, password } = await userService.createUserWithAutoPassword(
            adminData.email,
            adminData.role,
            adminData
        );

        // Send credentials email
        await emailService.sendUserCredentials(adminData.email, password, 'ADMIN');

        console.log('Admin user created successfully');
        console.log('Email:', adminData.email);
        console.log('Password:', password);
    } catch (error) {
        console.error('Error seeding admin:', error);
        throw error;
    }
};

// Run the seeder
seedAdmin()
    .then(() => {
        console.log('Admin seeding completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Admin seeding failed:', error);
        process.exit(1);
    }); 