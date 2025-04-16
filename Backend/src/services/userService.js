import { prisma } from '../databases/prismaClient.js';
import { AppError } from '../middlewares/errorHandler.js';
import bcrypt from 'bcryptjs';
import { config } from '../config/config.js';
import { generateRandomPassword } from '../utils/passwordGenerator.js';

export class UserService {
    async getUserProfile(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                role: true,
                student: {
                    include: {
                        class: true,
                        section: true,
                        parent: true,
                        address: true,
                        profilePicture: true,
                        subjectAttendance: true,
                        monthlyAttendance: true,
                        subjectResults: {
                            include: {
                                subject: true
                            }
                        },
                        overallResults: true,
                        leaveApplications: true,
                        achievements: true
                    }
                },
                teacher: {
                    include: {
                        designation: true,
                        address: true,
                        profilePicture: true,
                        subjects: {
                            include: {
                                subject: true
                            }
                        },
                        classes: {
                            include: {
                                class: true
                            }
                        },
                        periods: true,
                        classResults: true,
                        leaveApplications: true,
                        achievements: true,
                        announcements: true
                    }
                },
                admin: {
                    include: {
                        address: true,
                        profilePicture: true,
                        leaveApplications: true,
                        announcements: true
                    }
                },
                parent: {
                    include: {
                        address: true,
                        profilePicture: true,
                        children: {
                            include: {
                                class: true,
                                section: true,
                                subjectResults: true,
                                overallResults: true
                            }
                        }
                    }
                }
            }
        });

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        return user;
    }

    async updateProfile(userId, data) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                student: true,
                teacher: true,
                admin: true,
                parent: true
            }
        });

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        // Update address if provided
        if (data.address) {
            let addressId;
            switch (user.role) {
                case 'STUDENT':
                    addressId = user.student?.addressId;
                    break;
                case 'TEACHER':
                    addressId = user.teacher?.addressId;
                    break;
                case 'ADMIN':
                    addressId = user.admin?.addressId;
                    break;
                case 'PARENT':
                    addressId = user.parent?.addressId;
                    break;
            }

            if (addressId) {
                await prisma.address.update({
                    where: { id: addressId },
                    data: data.address
                });
            }
        }

        // Update role-specific profile
        switch (user.role) {
            case 'STUDENT':
                return await this.updateStudentProfile(user.student.id, data);
            case 'TEACHER':
                return await this.updateTeacherProfile(user.teacher.id, data);
            case 'ADMIN':
                return await this.updateAdminProfile(user.admin.id, data);
            case 'PARENT':
                return await this.updateParentProfile(user.parent.id, data);
            default:
                throw new AppError(400, 'Invalid user role');
        }
    }

    async updatePassword(userId, currentPassword, newPassword) {
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new AppError(404, 'User not found');
        }

        // Verify current password
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordCorrect) {
            throw new AppError(401, 'Current password is incorrect');
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, config.bcryptSaltRounds);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
    }

    async updateProfilePicture(userId, fileUrl) {
        console.log('Updating profile picture for user:', userId);
        console.log('With URL:', fileUrl);
        
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    student: true,
                    teacher: true,
                    admin: true,
                    parent: true
                }
            });

            if (!user) {
                throw new AppError(404, 'User not found');
            }

            console.log('User found with role:', user.role);

            // Create new profile picture
            const profilePicture = await prisma.profilePicture.create({
                data: { url: fileUrl }
            });

            console.log('Profile picture created:', profilePicture.id);

            // Update based on role
            let result;
            switch (user.role) {
                case 'STUDENT':
                    result = await prisma.student.update({
                        where: { id: user.student.id },
                        data: { profilePictureId: profilePicture.id },
                        include: {
                            profilePicture: true,
                            class: true,
                            section: true,
                            address: true
                        }
                    });
                    break;
                case 'TEACHER':
                    result = await prisma.teacher.update({
                        where: { id: user.teacher.id },
                        data: { profilePictureId: profilePicture.id },
                        include: {
                            profilePicture: true,
                            designation: true,
                            address: true
                        }
                    });
                    break;
                case 'ADMIN':
                    result = await prisma.admin.update({
                        where: { id: user.admin.id },
                        data: { profilePictureId: profilePicture.id },
                        include: {
                            profilePicture: true,
                            address: true
                        }
                    });
                    break;
                case 'PARENT':
                    result = await prisma.parent.update({
                        where: { id: user.parent.id },
                        data: { profilePictureId: profilePicture.id },
                        include: {
                            profilePicture: true,
                            address: true,
                            children: {
                                include: {
                                    class: true,
                                    section: true
                                }
                            }
                        }
                    });
                    break;
                default:
                    throw new AppError(400, 'Invalid user role');
            }
            
            console.log('Profile updated successfully');
            return result;
        } catch (error) {
            console.error('Error in updateProfilePicture service:', error);
            throw error;
        }
    }

    // Helper method for updating student profile
    async updateStudentProfile(studentId, data) {
        const updateData = {
            name: data.name,
            contactNo: data.contactNo,
            emergencyContact: data.emergencyContact,
            bloodGroup: data.bloodGroup,
            religion: data.religion
        };

        return await prisma.student.update({
            where: { id: studentId },
            data: updateData,
            include: {
                class: true,
                section: true,
                parent: true,
                address: true,
                profilePicture: true
            }
        });
    }

    // Helper method for updating teacher profile
    async updateTeacherProfile(teacherId, data) {
        const updateData = {
            name: data.name,
            contactNo: data.contactNo,
            emergencyContact: data.emergencyContact,
            bio: data.bio
        };

        return await prisma.teacher.update({
            where: { id: teacherId },
            data: updateData,
            include: {
                designation: true,
                address: true,
                profilePicture: true,
                subjects: {
                    include: {
                        subject: true
                    }
                },
                classes: {
                    include: {
                        class: true
                    }
                }
            }
        });
    }

    // Helper method for updating admin profile
    async updateAdminProfile(adminId, data) {
        const updateData = {
            fullName: data.fullName,
            phone: data.phone,
            emergencyContact: data.emergencyContact,
            bio: data.bio
        };

        return await prisma.admin.update({
            where: { id: adminId },
            data: updateData,
            include: {
                address: true,
                profilePicture: true
            }
        });
    }

    // Helper method for updating parent profile
    async updateParentProfile(parentId, data) {
        const updateData = {
            name: data.name,
            contactNo: data.contactNo
        };

        return await prisma.parent.update({
            where: { id: parentId },
            data: updateData,
            include: {
                address: true,
                profilePicture: true,
                children: {
                    include: {
                        class: true,
                        section: true
                    }
                }
            }
        });
    }

    async createUserWithAutoPassword(email, role, userData = {}) {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new AppError(400, 'User with this email already exists');
        }

        // Generate random password
        const password = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user with only user-specific fields
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role
            }
        });

        return { user, password };
    }

    async createStudentWithAutoPassword(email, studentData) {
        try {
            // First, verify required fields are present
            if (!email || !studentData.name || !studentData.gender || !studentData.rollNo) {
                throw new AppError(400, 'Missing required fields for student creation');
            }

            // Verify class and section exist
            if (!studentData.classId || !studentData.sectionId) {
                throw new AppError(400, 'Class and section are required');
            }

            // Make sure address data is complete
            if (!studentData.address || !studentData.address.addressLine1) {
                throw new AppError(400, 'Address information is required');
            }

            // First create the user
            const { user, password } = await this.createUserWithAutoPassword(email, 'STUDENT');
            
            // Extract fields that are only for the address
            const { 
                address,
                parentId,
                ...otherStudentData 
            } = studentData;
            
            // Create the address first
            console.log('Creating address:', address);
            const createdAddress = await prisma.address.create({
                data: address
            });
            
            if (!createdAddress || !createdAddress.id) {
                throw new AppError(500, 'Failed to create address record');
            }
            
            console.log('Address created with ID:', createdAddress.id);
            
            // Format dateOfBirth properly to ISO format
            let formattedData = { ...otherStudentData };
            if (formattedData.dateOfBirth) {
                // If it's just a date (YYYY-MM-DD), convert it to full ISO DateTime format
                if (formattedData.dateOfBirth.length === 10) { // Simple check for YYYY-MM-DD format
                    formattedData.dateOfBirth = new Date(`${formattedData.dateOfBirth}T00:00:00Z`).toISOString();
                }
                console.log('Formatted date of birth:', formattedData.dateOfBirth);
            }
            
            // Create student with correct relationships
            const studentCreateData = {
                userId: user.id,
                email,
                ...formattedData,
                addressId: createdAddress.id
            };
            
            // Add parent relation only if parentId is provided
            if (parentId) {
                studentCreateData.parentId = parseInt(parentId);
            }
            
            console.log('Creating student with data:', studentCreateData);
            
            // Create the student record
            const student = await prisma.student.create({
                data: studentCreateData
            });
            
            console.log('Student created successfully with ID:', student.id);

            return { user, password };
        } catch (error) {
            console.error('Error in createStudentWithAutoPassword:', error);
            
            // Clean up if user was created but student creation failed
            if (error.code === 'P2002') {
                throw new AppError(400, `Duplicate entry: ${error.meta?.target?.[0] || 'A record with this information'} already exists`);
            }
            
            throw error;
        }
    }

    async createParentWithAutoPassword(email, parentData) {
        try {
            // First create the user
            const { user, password } = await this.createUserWithAutoPassword(email, 'PARENT');
            
            // Extract fields that are only for the address and children
            const { 
                address,
                children,
                ...otherParentData 
            } = parentData;
            
            // Create the address first if provided
            let addressId;
            if (address) {
                const createdAddress = await prisma.address.create({
                    data: address
                });
                addressId = createdAddress.id;
            }
            
            // Format date fields if needed
            let formattedData = { ...otherParentData };
            if (formattedData.dateOfBirth && formattedData.dateOfBirth.length === 10) {
                formattedData.dateOfBirth = new Date(`${formattedData.dateOfBirth}T00:00:00Z`).toISOString();
            }
            
            // Create parent with correct relationships
            const parentCreateData = {
                userId: user.id,
                email,
                ...formattedData,
                ...(addressId ? { addressId } : {})
            };
            
            // Create the parent record
            const parent = await prisma.parent.create({
                data: parentCreateData
            });
            
            // Connect children to parent if provided
            if (children && Array.isArray(children) && children.length > 0) {
                // Update each child to connect to this parent
                for (const childId of children) {
                    await prisma.student.update({
                        where: { id: parseInt(childId) },
                        data: { parentId: parent.id }
                    });
                }
            }

            return { user, password };
        } catch (error) {
            console.error('Error in createParentWithAutoPassword:', error);
            
            // Clean up if user was created but parent creation failed
            if (error.code === 'P2002') {
                throw new AppError(400, `Duplicate entry: ${error.meta?.target?.[0] || 'A record with this information'} already exists`);
            }
            
            throw error;
        }
    }

    async createTeacherWithAutoPassword(email, teacherData) {
        try {
            // First create the user
            const { user, password } = await this.createUserWithAutoPassword(email, 'TEACHER');
            
            // Extract fields that are only for the address
            const { 
                address,
                subjects,
                classes,
                sections,
                ...otherTeacherData 
            } = teacherData;
            
            // Create the address first if provided
            let addressId;
            if (address) {
                const createdAddress = await prisma.address.create({
                    data: address
                });
                addressId = createdAddress.id;
            }
            
            // Format date fields properly
            let formattedData = { ...otherTeacherData };
            if (formattedData.dateOfBirth && formattedData.dateOfBirth.length === 10) {
                formattedData.dateOfBirth = new Date(`${formattedData.dateOfBirth}T00:00:00Z`).toISOString();
            }
            if (formattedData.joinDate && formattedData.joinDate.length === 10) {
                formattedData.joinDate = new Date(`${formattedData.joinDate}T00:00:00Z`).toISOString();
            }
            
            // Create teacher with correct relationships
            const teacherCreateData = {
                userId: user.id,
                email,
                ...formattedData,
                ...(addressId ? { addressId } : {})
            };
            
            // Create the teacher record
            const teacher = await prisma.teacher.create({
                data: teacherCreateData
            });
            
            // Connect subjects if provided
            if (subjects && Array.isArray(subjects) && subjects.length > 0) {
                for (const subjectId of subjects) {
                    await prisma.teacherSubject.create({
                        data: {
                            teacherId: teacher.id,
                            subjectId: parseInt(subjectId)
                        }
                    });
                }
            }
            
            // Connect classes if provided
            if (classes && Array.isArray(classes) && classes.length > 0) {
                for (const classId of classes) {
                    await prisma.teacherClass.create({
                        data: {
                            teacherId: teacher.id,
                            classId: parseInt(classId)
                        }
                    });
                }
            }
            
            // Connect sections if provided
            if (sections && Array.isArray(sections) && sections.length > 0) {
                for (const sectionId of sections) {
                    await prisma.teacherSection.create({
                        data: {
                            teacherId: teacher.id,
                            sectionId: parseInt(sectionId)
                        }
                    });
                }
            }

            return { user, password };
        } catch (error) {
            console.error('Error in createTeacherWithAutoPassword:', error);
            
            // Clean up if user was created but teacher creation failed
            if (error.code === 'P2002') {
                throw new AppError(400, `Duplicate entry: ${error.meta?.target?.[0] || 'A record with this information'} already exists`);
            }
            
            throw error;
        }
    }

    async getUserByEmail(email) {
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                student: true,
                teacher: true,
                admin: true,
                parent: true
            }
        });

        return user;
    }
}