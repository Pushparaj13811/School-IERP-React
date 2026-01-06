import { UserService } from '../services/userService.js';
import { emailService } from '../services/emailService.js';
import dotenv from 'dotenv';

dotenv.config();

const userService = new UserService();

/**
 * Admin Seeder
 *
 * Required Environment Variables:
 * - ADMIN_EMAIL: Email for the admin account
 * - ADMIN_FULL_NAME: Full name of the admin (optional, defaults to 'System Admin')
 * - ADMIN_PHONE: Phone number (optional, defaults to '0000000000')
 *
 * Usage: npm run seed:admin
 */
const seedAdmin = async () => {
    try {
        // Get admin details from environment variables
        const adminEmail = process.env.ADMIN_EMAIL;

        if (!adminEmail) {
            console.error('ERROR: ADMIN_EMAIL environment variable is required');
            console.error('Please set ADMIN_EMAIL in your .env file before running this seeder');
            process.exit(1);
        }

        // Check if admin already exists
        const existingAdmin = await userService.getUserByEmail(adminEmail);
        if (existingAdmin) {
            console.log('Admin user already exists with email:', adminEmail);
            return;
        }

        // Create admin user with environment-based configuration
        const adminData = {
            email: adminEmail,
            role: 'ADMIN',
            admin: {
                create: {
                    email: adminEmail,
                    fullName: process.env.ADMIN_FULL_NAME || 'System Admin',
                    phone: process.env.ADMIN_PHONE || '0000000000',
                    dateOfBirth: new Date(process.env.ADMIN_DOB || '1990-01-01'),
                    emergencyContact: process.env.ADMIN_EMERGENCY_CONTACT || '0000000000',
                    joinDate: new Date(),
                    bio: 'System Administrator',
                    address: {
                        create: {
                            addressLine1: process.env.SCHOOL_ADDRESS || 'School Address',
                            street: process.env.SCHOOL_STREET || 'Main Street',
                            city: process.env.SCHOOL_CITY || 'City',
                            ward: process.env.SCHOOL_WARD || '1',
                            municipality: process.env.SCHOOL_MUNICIPALITY || 'Municipality',
                            district: process.env.SCHOOL_DISTRICT || 'District',
                            province: process.env.SCHOOL_PROVINCE || 'Province',
                            country: process.env.SCHOOL_COUNTRY || 'Nepal',
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
        try {
            await emailService.sendUserCredentials(adminData.email, password, 'ADMIN');
            console.log('Admin credentials sent to email:', adminEmail);
        } catch (emailError) {
            // Log error but don't fail - credentials will be shown in console for development
            console.error('Warning: Failed to send email. Error:', emailError.message);
        }

        console.log('Admin user created successfully');
        console.log('Email:', adminData.email);

        // Only show password in development mode
        if (process.env.NODE_ENV !== 'production') {
            console.log('Password:', password);
            console.log('\n*** IMPORTANT: Change this password immediately after first login! ***\n');
        } else {
            console.log('Password has been sent to the admin email address.');
            console.log('If email delivery fails, run this seeder in development mode to see the password.');
        }
    } catch (error) {
        console.error('Error seeding admin:', error.message);
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
        console.error('Admin seeding failed:', error.message);
        process.exit(1);
    }); 