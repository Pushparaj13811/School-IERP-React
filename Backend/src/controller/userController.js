import { UserService } from '../services/userService.js';
import { AppError } from '../middlewares/errorHandler.js';
import { emailService } from '../services/emailService.js';
import { PrismaClient } from '@prisma/client';

const userService = new UserService();
const prisma = new PrismaClient();

export const getProfile = async (req, res, next) => {
    try {
        const user = await userService.getUserProfile(req.user.id);
        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const updatedUser = await userService.updateProfile(req.user.id, req.body);
        res.status(200).json({
            status: 'success',
            data: { user: updatedUser }
        });
    } catch (error) {
        next(error);
    }
};

export const updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            return next(new AppError(400, 'New passwords do not match'));
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return next(new AppError(400, 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'));
        }

        await userService.updatePassword(req.user.id, currentPassword, newPassword);

        res.status(200).json({
            status: 'success',
            message: 'Password updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfilePicture = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new AppError(400, 'Please upload a file'));
        }

        console.log('File upload received:', req.file);

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return next(new AppError(400, 'Please upload an image file (jpeg, jpg, or png)'));
        }

        // Generate a proper URL for the uploaded file
        // Use absolute path with protocol for better cross-origin compatibility
        const host = req.headers.host;
        const protocol = req.secure ? 'https' : 'http';
        const fileUrl = `${protocol}://${host}/uploads/profiles/${req.file.filename}`;
        
        console.log('File URL:', fileUrl);

        try {
            const profilePicture = await userService.updateProfilePicture(req.user.id, fileUrl);
            
            res.status(200).json({
                status: 'success',
                data: { profilePicture }
            });
        } catch (profileError) {
            console.error('Error updating profile picture in database:', profileError);
            return next(new AppError(500, 'Error saving profile picture to database'));
        }
    } catch (error) {
        console.error('Error in file upload:', error);
        next(error);
    }
};

export const createUser = async (req, res, next) => {
    try {
        // Check if the requesting user is an admin
        if (req.user.role !== 'ADMIN') {
            return next(new AppError(403, 'Only admins can create users'));
        }

        const { email, role, ...userData } = req.body;

        // Create user with auto-generated password
        const { user, password } = await userService.createUserWithAutoPassword(email, role, userData);

        // Send email with credentials
        await emailService.sendUserCredentials(email, password, role);

        res.status(201).json({
            status: 'success',
            message: 'User created successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const createStudent = async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return next(new AppError(403, 'Only admins can create students'));
        }

        const { email, ...studentData } = req.body;
        const { user, password } = await userService.createStudentWithAutoPassword(email, studentData);
        
        await emailService.sendUserCredentials(email, password, 'STUDENT');

        res.status(201).json({
            status: 'success',
            message: 'Student created successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const createParent = async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return next(new AppError(403, 'Only admins can create parents'));
        }

        const { email, ...parentData } = req.body;
        const { user, password } = await userService.createParentWithAutoPassword(email, parentData);
        
        await emailService.sendUserCredentials(email, password, 'PARENT');

        res.status(201).json({
            status: 'success',
            message: 'Parent created successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const createTeacher = async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return next(new AppError(403, 'Only admins can create teachers'));
        }

        const { email, ...teacherData } = req.body;
        const { user, password } = await userService.createTeacherWithAutoPassword(email, teacherData);
        
        await emailService.sendUserCredentials(email, password, 'TEACHER');

        res.status(201).json({
            status: 'success',
            message: 'Teacher created successfully',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const getStudents = async (req, res, next) => {
    try {
        const students = await prisma.student.findMany({
            include: {
                user: true,
                class: true,
                section: true,
                parent: true,
                profilePicture: true
            }
        });
        
        // Format the data for the client
        const formattedStudents = students.map(student => ({
            id: student.id,
            name: student.name,
            email: student.user.email,
            gender: student.gender,
            rollNo: student.rollNo,
            contactNo: student.contactNo,
            class: student.class,
            section: student.section,
            parent: student.parent,
            profilePicture: student.profilePicture?.url
        }));
        
        res.status(200).json({
            status: 'success',
            data: {
                students: formattedStudents
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getParents = async (req, res, next) => {
    try {
        const parents = await prisma.parent.findMany({
            include: {
                user: true,
                children: {
                    include: {
                        class: true,
                        section: true
                    }
                },
                profilePicture: true
            }
        });
        
        // Format the data for the client
        const formattedParents = parents.map(parent => ({
            id: parent.id,
            name: parent.name,
            email: parent.user.email,
            gender: parent.gender,
            contactNo: parent.contactNo,
            children: parent.children.map(child => ({
                id: child.id,
                name: child.name,
                class: child.class?.name,
                section: child.section?.name
            })),
            profilePicture: parent.profilePicture?.url
        }));
        
        res.status(200).json({
            status: 'success',
            data: {
                parents: formattedParents
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getTeachers = async (req, res, next) => {
    try {
        const teachers = await prisma.teacher.findMany({
            include: {
                user: true,
                designation: true,
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
                profilePicture: true
            }
        });
        
        // Format the data for the client
        const formattedTeachers = teachers.map(teacher => ({
            id: teacher.id,
            name: teacher.name,
            email: teacher.user.email,
            gender: teacher.gender,
            contactNo: teacher.contactNo,
            designation: teacher.designation,
            subjects: teacher.subjects.map(s => s.subject),
            classes: teacher.classes.map(c => c.class),
            profilePicture: teacher.profilePicture?.url
        }));
        
        res.status(200).json({
            status: 'success',
            data: {
                teachers: formattedTeachers
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getUsers = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                student: {
                    include: {
                        class: true,
                        section: true
                    }
                },
                teacher: true,
                parent: true,
                admin: true
            }
        });
        
        // Format the data for the client
        const formattedUsers = users.map(user => {
            const userRole = user.role;
            let roleSpecificData = {};
            
            if (userRole === 'STUDENT' && user.student) {
                roleSpecificData = {
                    studentId: user.student.id,
                    name: user.student.name,
                    rollNo: user.student.rollNo,
                    class: user.student.class?.name,
                    section: user.student.section?.name
                };
            } else if (userRole === 'TEACHER' && user.teacher) {
                roleSpecificData = {
                    teacherId: user.teacher.id,
                    name: user.teacher.name,
                    designation: user.teacher.designation
                };
            } else if (userRole === 'PARENT' && user.parent) {
                roleSpecificData = {
                    parentId: user.parent.id,
                    name: user.parent.name
                };
            } else if (userRole === 'ADMIN' && user.admin) {
                roleSpecificData = {
                    adminId: user.admin.id,
                    name: user.admin.name
                };
            }
            
            return {
                id: user.id,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                ...roleSpecificData
            };
        });
        
        res.status(200).json({
            status: 'success',
            data: {
                users: formattedUsers
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get student by ID
export const getStudentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Convert ID to number
        const studentId = Number(id);
        
        // Validate ID
        if (isNaN(studentId)) {
            return next(new AppError(400, 'Invalid student ID'));
        }
        
        // Fetch student with all related data
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                user: true,
                class: true,
                section: true,
                parent: true,
                profilePicture: true,
                address: true
            }
        });
        
        // Check if student exists
        if (!student) {
            return next(new AppError(404, 'Student not found'));
        }
        
        // Format student data for response
        const formattedStudent = {
            id: student.id,
            name: student.name,
            nameAsPerBirth: student.nameAsPerBirth,
            email: student.user.email,
            gender: student.gender,
            rollNo: student.rollNo,
            contactNo: student.contactNo,
            emergencyContact: student.emergencyContact,
            dateOfBirth: student.dateOfBirth,
            dobNo: student.dobNo,
            bloodGroup: student.bloodGroup,
            nationality: student.nationality,
            religion: student.religion,
            fatherName: student.fatherName,
            motherName: student.motherName,
            classId: student.classId,
            sectionId: student.sectionId,
            parentId: student.parentId,
            class: student.class,
            section: student.section,
            parent: student.parent,
            address: student.address,
            profilePicture: student.profilePicture?.url
        };
        
        res.status(200).json({
            status: 'success',
            data: {
                student: formattedStudent
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get teacher by ID
export const getTeacherById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Convert ID to number
        const teacherId = Number(id);
        
        // Validate ID
        if (isNaN(teacherId)) {
            return next(new AppError(400, 'Invalid teacher ID'));
        }
        
        // Fetch teacher with all related data
        const teacher = await prisma.teacher.findUnique({
            where: { id: teacherId },
            include: {
                user: true,
                designation: true,
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
                profilePicture: true,
                address: true
            }
        });
        
        // Check if teacher exists
        if (!teacher) {
            return next(new AppError(404, 'Teacher not found'));
        }
        
        // Format teacher data for response
        const formattedTeacher = {
            id: teacher.id,
            name: teacher.name,
            email: teacher.user.email,
            gender: teacher.gender,
            contactNo: teacher.contactNo,
            designation: teacher.designation,
            subjects: teacher.subjects.map(s => s.subject),
            classes: teacher.classes.map(c => c.class),
            address: teacher.address,
            profilePicture: teacher.profilePicture?.url
        };
        
        res.status(200).json({
            status: 'success',
            data: {
                teacher: formattedTeacher
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get parent by ID
export const getParentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        // Convert ID to number
        const parentId = Number(id);
        
        // Validate ID
        if (isNaN(parentId)) {
            return next(new AppError(400, 'Invalid parent ID'));
        }
        
        // Fetch parent with all related data
        const parent = await prisma.parent.findUnique({
            where: { id: parentId },
            include: {
                user: true,
                children: {
                    include: {
                        class: true,
                        section: true
                    }
                },
                profilePicture: true,
                address: true
            }
        });
        
        // Check if parent exists
        if (!parent) {
            return next(new AppError(404, 'Parent not found'));
        }
        
        // Format parent data for response
        const formattedParent = {
            id: parent.id,
            name: parent.name,
            email: parent.user.email,
            gender: parent.gender,
            contactNo: parent.contactNo,
            children: parent.children.map(child => ({
                id: child.id,
                name: child.name,
                class: child.class?.name,
                section: child.section?.name
            })),
            address: parent.address,
            profilePicture: parent.profilePicture?.url
        };
        
        res.status(200).json({
            status: 'success',
            data: {
                parent: formattedParent
            }
        });
    } catch (error) {
        next(error);
    }
};

// Update student by ID
export const updateStudent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };
        
        // Check if user is authorized to update students
        if (req.user.role !== 'ADMIN') {
            return next(new AppError(403, 'Only admins can update students'));
        }
        
        // Convert ID to number
        const studentId = Number(id);
        
        // Validate ID
        if (isNaN(studentId)) {
            return next(new AppError(400, 'Invalid student ID'));
        }
        
        // Check if student exists
        const studentExists = await prisma.student.findUnique({
            where: { id: studentId }
        });
        
        if (!studentExists) {
            return next(new AppError(404, 'Student not found'));
        }
        
        // Extract address data if provided
        const addressData = data.address ? { ...data.address } : undefined;
        delete data.address;
        
        // Extract class and section IDs and convert to nested connect operations
        const classId = data.classId ? Number(data.classId) : undefined;
        const sectionId = data.sectionId ? Number(data.sectionId) : undefined;
        const parentId = data.parentId ? Number(data.parentId) : undefined;
        
        // Remove direct ID properties
        delete data.classId;
        delete data.sectionId;
        delete data.parentId;

        // Add nested relation updates
        if (classId) {
            data.class = {
                connect: { id: classId }
            };
        }
        
        if (sectionId) {
            data.section = {
                connect: { id: sectionId }
            };
        }
        
        if (parentId) {
            data.parent = {
                connect: { id: parentId }
            };
        } else if (data.parentId === null) {
            // If parentId is explicitly set to null, disconnect the parent
            data.parent = {
                disconnect: true
            };
        }
        
        console.log('Updating student with data:', JSON.stringify(data, null, 2));
        
        // Update student data
        const updatedStudent = await prisma.student.update({
            where: { id: studentId },
            data: {
                ...data,
                // Create or update address if provided
                ...(addressData && {
                    address: {
                        upsert: {
                            create: addressData,
                            update: addressData
                        }
                    }
                })
            },
            include: {
                user: true,
                class: true,
                section: true,
                parent: true,
                profilePicture: true,
                address: true
            }
        });
        
        // Format student data for response
        const formattedStudent = {
            id: updatedStudent.id,
            name: updatedStudent.name,
            email: updatedStudent.user.email,
            gender: updatedStudent.gender,
            rollNo: updatedStudent.rollNo,
            contactNo: updatedStudent.contactNo,
            emergencyContact: updatedStudent.emergencyContact,
            dateOfBirth: updatedStudent.dateOfBirth,
            dobNo: updatedStudent.dobNo,
            bloodGroup: updatedStudent.bloodGroup,
            nationality: updatedStudent.nationality,
            religion: updatedStudent.religion,
            fatherName: updatedStudent.fatherName,
            motherName: updatedStudent.motherName,
            class: updatedStudent.class,
            section: updatedStudent.section,
            parent: updatedStudent.parent,
            address: updatedStudent.address,
            profilePicture: updatedStudent.profilePicture?.url
        };
        
        res.status(200).json({
            status: 'success',
            message: 'Student updated successfully',
            data: {
                student: formattedStudent
            }
        });
    } catch (error) {
        console.error('Error updating student:', error);
        next(error);
    }
};

// Update parent by ID
export const updateParent = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };
        
        // Check if user is authorized to update parents
        if (req.user.role !== 'ADMIN') {
            return next(new AppError(403, 'Only admins can update parents'));
        }
        
        // Convert ID to number
        const parentId = Number(id);
        
        // Validate ID
        if (isNaN(parentId)) {
            return next(new AppError(400, 'Invalid parent ID'));
        }
        
        // Check if parent exists
        const parentExists = await prisma.parent.findUnique({
            where: { id: parentId }
        });
        
        if (!parentExists) {
            return next(new AppError(404, 'Parent not found'));
        }
        
        // Extract address data if provided
        const addressData = data.address ? { ...data.address } : undefined;
        delete data.address;
        
        // Extract children data if provided
        const childrenIds = data.children;
        delete data.children;

        console.log('Updating parent with data:', JSON.stringify(data, null, 2));

        // Update parent data
        const updatedParent = await prisma.parent.update({
            where: { id: parentId },
            data: {
                ...data,
                // Create or update address if provided
                ...(addressData && {
                    address: {
                        upsert: {
                            create: addressData,
                            update: addressData
                        }
                    }
                }),
                // Update children relationships if provided
                ...(childrenIds && {
                    children: {
                        set: childrenIds.map(childId => ({ id: Number(childId) }))
                    }
                })
            },
            include: {
                user: true,
                children: {
                    include: {
                        class: true,
                        section: true
                    }
                },
                profilePicture: true,
                address: true
            }
        });
        
        // Format parent data for response
        const formattedParent = {
            id: updatedParent.id,
            name: updatedParent.name,
            email: updatedParent.user.email,
            gender: updatedParent.gender,
            contactNo: updatedParent.contactNo,
            children: updatedParent.children.map(child => ({
                id: child.id,
                name: child.name,
                class: child.class?.name,
                section: child.section?.name
            })),
            address: updatedParent.address,
            profilePicture: updatedParent.profilePicture?.url
        };
        
        res.status(200).json({
            status: 'success',
            message: 'Parent updated successfully',
            data: {
                parent: formattedParent
            }
        });
    } catch (error) {
        console.error('Error updating parent:', error);
        next(error);
    }
};

// Update teacher by ID
export const updateTeacher = async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };
        
        // Check if user is authorized to update teachers
        if (req.user.role !== 'ADMIN') {
            return next(new AppError(403, 'Only admins can update teachers'));
        }
        
        // Convert ID to number
        const teacherId = Number(id);
        
        // Validate ID
        if (isNaN(teacherId)) {
            return next(new AppError(400, 'Invalid teacher ID'));
        }
        
        // Check if teacher exists
        const teacherExists = await prisma.teacher.findUnique({
            where: { id: teacherId }
        });
        
        if (!teacherExists) {
            return next(new AppError(404, 'Teacher not found'));
        }
        
        // Extract address data if provided
        const addressData = data.address ? { ...data.address } : undefined;
        delete data.address;
        
        // Extract subjects and classes data if provided
        const subjectIds = data.subjects;
        const classIds = data.classes;
        delete data.subjects;
        delete data.classes;

        console.log('Updating teacher with data:', JSON.stringify(data, null, 2));

        // Update teacher data
        const updatedTeacher = await prisma.teacher.update({
            where: { id: teacherId },
            data: {
                ...data,
                // Create or update address if provided
                ...(addressData && {
                    address: {
                        upsert: {
                            create: addressData,
                            update: addressData
                        }
                    }
                }),
                // Update subjects relationships if provided
                ...(subjectIds && {
                    subjects: {
                        deleteMany: {},
                        create: subjectIds.map(subjectId => ({
                            subject: {
                                connect: { id: Number(subjectId) }
                            }
                        }))
                    }
                }),
                // Update classes relationships if provided
                ...(classIds && {
                    classes: {
                        deleteMany: {},
                        create: classIds.map(classId => ({
                            class: {
                                connect: { id: Number(classId) }
                            }
                        }))
                    }
                })
            },
            include: {
                user: true,
                designation: true,
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
                profilePicture: true,
                address: true
            }
        });
        
        // Format teacher data for response
        const formattedTeacher = {
            id: updatedTeacher.id,
            name: updatedTeacher.name,
            email: updatedTeacher.user.email,
            gender: updatedTeacher.gender,
            contactNo: updatedTeacher.contactNo,
            designation: updatedTeacher.designation,
            subjects: updatedTeacher.subjects.map(s => s.subject),
            classes: updatedTeacher.classes.map(c => c.class),
            address: updatedTeacher.address,
            profilePicture: updatedTeacher.profilePicture?.url
        };
        
        res.status(200).json({
            status: 'success',
            message: 'Teacher updated successfully',
            data: {
                teacher: formattedTeacher
            }
        });
    } catch (error) {
        console.error('Error updating teacher:', error);
        next(error);
    }
};

export const updateProfilePictureById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userRole = req.params.userRole; // STUDENT, PARENT, or TEACHER
        
        if (!req.file) {
            return next(new AppError(400, 'Please upload a file'));
        }

        if (!id || !userRole) {
            return next(new AppError(400, 'Missing required parameters'));
        }

        console.log(`Updating profile picture for ${userRole} with ID: ${id}`, req.file);

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return next(new AppError(400, 'Please upload an image file (jpeg, jpg, or png)'));
        }

        // Generate a proper URL for the uploaded file
        const host = req.headers.host;
        const protocol = req.secure ? 'https' : 'http';
        const fileUrl = `${protocol}://${host}/uploads/profiles/${req.file.filename}`;
        
        console.log('File URL:', fileUrl);

        try {
            let userId;
            
            // Find the user ID based on the role and entity ID
            switch (userRole) {
                case 'STUDENT':
                    const student = await prisma.student.findUnique({
                        where: { id: parseInt(id) },
                        select: { userId: true }
                    });
                    if (!student) return next(new AppError(404, 'Student not found'));
                    userId = student.userId;
                    break;
                
                case 'PARENT':
                    const parent = await prisma.parent.findUnique({
                        where: { id: parseInt(id) },
                        select: { userId: true }
                    });
                    if (!parent) return next(new AppError(404, 'Parent not found'));
                    userId = parent.userId;
                    break;
                
                case 'TEACHER':
                    const teacher = await prisma.teacher.findUnique({
                        where: { id: parseInt(id) },
                        select: { userId: true }
                    });
                    if (!teacher) return next(new AppError(404, 'Teacher not found'));
                    userId = teacher.userId;
                    break;
                
                default:
                    return next(new AppError(400, 'Invalid user role'));
            }
            
            console.log(`Found user ID ${userId} for ${userRole} with ID ${id}`);
            
            // Create profile picture and update user
            const profilePicture = await userService.updateProfilePicture(userId, fileUrl);
            
            res.status(200).json({
                status: 'success',
                data: { profilePicture }
            });
        } catch (profileError) {
            console.error(`Error updating profile picture for ${userRole} with ID ${id}:`, profileError);
            return next(new AppError(500, 'Error saving profile picture to database'));
        }
    } catch (error) {
        console.error('Error in file upload:', error);
        next(error);
    }
}; 