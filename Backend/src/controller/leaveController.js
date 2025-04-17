import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler.js';

const prisma = new PrismaClient();

// Create a new leave application
export const createLeaveApplication = async (req, res, next) => {
    try {
        const { 
            leaveTypeId, 
            subject, 
            fromDate, 
            toDate, 
            description 
        } = req.body;
        
        if (!leaveTypeId || !subject || !fromDate || !toDate || !description) {
            return next(new AppError(400, 'Missing required fields'));
        }
        
        // Determine the applicant type based on the user's role
        let applicantType;
        let applicantId;
        
        switch (req.user.role) {
            case 'STUDENT':
                applicantType = 'STUDENT';
                applicantId = req.user.student.id;
                break;
            case 'TEACHER':
                applicantType = 'TEACHER';
                applicantId = req.user.teacher.id;
                break;
            case 'ADMIN':
                applicantType = 'ADMIN';
                applicantId = req.user.admin.id;
                break;
            default:
                return next(new AppError(400, 'Invalid user role for leave application'));
        }
        
        // Create the leave application
        const leaveApplication = await prisma.leaveApplication.create({
            data: {
                leaveTypeId: Number(leaveTypeId),
                subject,
                fromDate: new Date(fromDate),
                toDate: new Date(toDate),
                description,
                applicantId,
                applicantType,
                status: 'PENDING'
            },
            include: {
                leaveType: true,
                student: {
                    include: {
                        class: true,
                        section: true
                    }
                },
                teacher: {
                    include: {
                        designation: true
                    }
                }
            }
        });
        
        res.status(201).json({
            status: 'success',
            data: {
                leaveApplication
            }
        });
    } catch (error) {
        console.error('Error creating leave application:', error);
        next(error);
    }
};

// Get all leave applications (with filtering options)
export const getLeaveApplications = async (req, res, next) => {
    try {
        const { 
            status, 
            applicantType, 
            fromDate, 
            toDate, 
            studentId, 
            teacherId,
            classId,
            sectionId
        } = req.query;
        
        // Build the where clause based on user role and query parameters
        let where = {};
        
        // Add filters if provided
        if (status) {
            where.status = status;
        }
        
        if (applicantType) {
            where.applicantType = applicantType;
        }
        
        if (fromDate) {
            where.fromDate = {
                gte: new Date(fromDate)
            };
        }
        
        if (toDate) {
            where.toDate = {
                lte: new Date(toDate)
            };
        }
        
        // Role-based filters
        switch (req.user.role) {
            case 'STUDENT':
                // Students can only see their own applications
                where.applicantId = req.user.student.id;
                where.applicantType = 'STUDENT';
                break;
                
            case 'TEACHER':
                // If specific student is requested
                if (studentId) {
                    // Verify teacher teaches the student's class
                    const student = await prisma.student.findUnique({
                        where: { id: Number(studentId) },
                        select: { 
                            classId: true,
                            sectionId: true
                        }
                    });
                    
                    if (!student) {
                        return next(new AppError(404, 'Student not found'));
                    }
                    
                    // Check if teacher teaches this class/section
                    const teachesClass = await prisma.teacherClass.findFirst({
                        where: {
                            teacherId: req.user.teacher.id,
                            classId: student.classId
                        }
                    });
                    
                    const teachesSection = await prisma.teacherSection.findFirst({
                        where: {
                            teacherId: req.user.teacher.id,
                            sectionId: student.sectionId
                        }
                    });
                    
                    if (!teachesClass || !teachesSection) {
                        return next(new AppError(403, 'You do not teach this student'));
                    }
                    
                    where.applicantId = Number(studentId);
                    where.applicantType = 'STUDENT';
                } else if (classId && sectionId) {
                    // Check if teacher teaches this class/section
                    const teachesClass = await prisma.teacherClass.findFirst({
                        where: {
                            teacherId: req.user.teacher.id,
                            classId: Number(classId)
                        }
                    });
                    
                    const teachesSection = await prisma.teacherSection.findFirst({
                        where: {
                            teacherId: req.user.teacher.id,
                            sectionId: Number(sectionId)
                        }
                    });
                    
                    if (!teachesClass || !teachesSection) {
                        return next(new AppError(403, 'You do not teach this class/section'));
                    }
                    
                    // Get all students in this class and section
                    const students = await prisma.student.findMany({
                        where: {
                            classId: Number(classId),
                            sectionId: Number(sectionId)
                        },
                        select: { id: true }
                    });
                    
                    where.applicantId = {
                        in: students.map(s => s.id)
                    };
                    where.applicantType = 'STUDENT';
                } else {
                    // Teacher's own applications or applications they can approve
                    where.OR = [
                        // Teacher's own applications
                        {
                            applicantId: req.user.teacher.id,
                            applicantType: 'TEACHER'
                        },
                        // Students' applications from classes they teach
                        {
                            applicantType: 'STUDENT',
                            student: {
                                class: {
                                    teacherClasses: {
                                        some: {
                                            teacherId: req.user.teacher.id
                                        }
                                    }
                                },
                                section: {
                                    teacherSections: {
                                        some: {
                                            teacherId: req.user.teacher.id
                                        }
                                    }
                                }
                            }
                        }
                    ];
                }
                break;
                
            case 'ADMIN':
                // Admin can see all applications
                // Admin can filter by specific teacher or student
                if (teacherId) {
                    where.applicantId = Number(teacherId);
                    where.applicantType = 'TEACHER';
                } else if (studentId) {
                    where.applicantId = Number(studentId);
                    where.applicantType = 'STUDENT';
                } else if (classId) {
                    // Get all students in this class
                    const students = await prisma.student.findMany({
                        where: {
                            classId: Number(classId),
                            ...(sectionId ? { sectionId: Number(sectionId) } : {})
                        },
                        select: { id: true }
                    });
                    
                    where.applicantId = {
                        in: students.map(s => s.id)
                    };
                    where.applicantType = 'STUDENT';
                }
                break;
                
            default:
                return next(new AppError(403, 'Unauthorized to view leave applications'));
        }
        
        // Get leave applications with appropriate includes
        const leaveApplications = await prisma.leaveApplication.findMany({
            where,
            include: {
                leaveType: true,
                student: {
                    include: {
                        class: true,
                        section: true
                    }
                },
                teacher: {
                    include: {
                        designation: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        
        res.status(200).json({
            status: 'success',
            results: leaveApplications.length,
            data: {
                leaveApplications
            }
        });
    } catch (error) {
        console.error('Error fetching leave applications:', error);
        next(error);
    }
};

// Get a single leave application by ID
export const getLeaveApplicationById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const leaveApplication = await prisma.leaveApplication.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                leaveType: true,
                student: {
                    include: {
                        class: true,
                        section: true
                    }
                },
                teacher: {
                    include: {
                        designation: true
                    }
                }
            }
        });
        
        if (!leaveApplication) {
            return next(new AppError(404, 'Leave application not found'));
        }
        
        // Check permissions based on role
        switch (req.user.role) {
            case 'STUDENT':
                // Students can only view their own applications
                if (
                    leaveApplication.applicantType !== 'STUDENT' || 
                    leaveApplication.applicantId !== req.user.student.id
                ) {
                    return next(new AppError(403, 'You can only view your own leave applications'));
                }
                break;
                
            case 'TEACHER':
                // Teachers can view their own applications or those of students they teach
                if (leaveApplication.applicantType === 'TEACHER') {
                    if (leaveApplication.applicantId !== req.user.teacher.id) {
                        return next(new AppError(403, 'You can only view your own leave applications'));
                    }
                } else if (leaveApplication.applicantType === 'STUDENT') {
                    // Check if teacher teaches this student's class
                    const student = leaveApplication.student;
                    
                    const teachesClass = await prisma.teacherClass.findFirst({
                        where: {
                            teacherId: req.user.teacher.id,
                            classId: student.classId
                        }
                    });
                    
                    const teachesSection = await prisma.teacherSection.findFirst({
                        where: {
                            teacherId: req.user.teacher.id,
                            sectionId: student.sectionId
                        }
                    });
                    
                    if (!teachesClass || !teachesSection) {
                        return next(new AppError(403, 'You do not teach this student'));
                    }
                } else {
                    return next(new AppError(403, 'Unauthorized to view this leave application'));
                }
                break;
                
            case 'ADMIN':
                // Admins can view all leave applications
                break;
                
            default:
                return next(new AppError(403, 'Unauthorized to view leave applications'));
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                leaveApplication
            }
        });
    } catch (error) {
        console.error('Error fetching leave application:', error);
        next(error);
    }
};

// Update a leave application's status (approve/reject)
export const updateLeaveStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, remarks } = req.body;
        
        if (!status || !['APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) {
            return next(new AppError(400, 'Invalid status. Must be APPROVED, REJECTED or CANCELLED'));
        }
        
        // Find the leave application
        const leaveApplication = await prisma.leaveApplication.findUnique({
            where: {
                id: Number(id)
            },
            include: {
                student: {
                    include: {
                        class: true,
                        section: true
                    }
                },
                teacher: true
            }
        });
        
        if (!leaveApplication) {
            return next(new AppError(404, 'Leave application not found'));
        }
        
        // Check permissions based on role
        switch (req.user.role) {
            case 'STUDENT':
                // Students can only cancel their own applications
                if (
                    leaveApplication.applicantType !== 'STUDENT' || 
                    leaveApplication.applicantId !== req.user.student.id
                ) {
                    return next(new AppError(403, 'You can only update your own leave applications'));
                }
                
                if (status !== 'CANCELLED') {
                    return next(new AppError(403, 'Students can only cancel leave applications'));
                }
                
                // Check if leave is already approved or rejected
                if (['APPROVED', 'REJECTED'].includes(leaveApplication.status)) {
                    return next(new AppError(400, 'Cannot cancel an already processed leave application'));
                }
                break;
                
            case 'TEACHER':
                // Teachers can approve/reject student applications (if they teach the class)
                // Or cancel their own pending applications
                if (leaveApplication.applicantType === 'TEACHER') {
                    if (leaveApplication.applicantId !== req.user.teacher.id) {
                        return next(new AppError(403, 'You can only update your own leave applications'));
                    }
                    
                    if (status !== 'CANCELLED') {
                        return next(new AppError(403, 'Teachers can only cancel their own leave applications'));
                    }
                    
                    // Check if leave is already approved or rejected
                    if (['APPROVED', 'REJECTED'].includes(leaveApplication.status)) {
                        return next(new AppError(400, 'Cannot cancel an already processed leave application'));
                    }
                } else if (leaveApplication.applicantType === 'STUDENT') {
                    // Check if teacher teaches this student's class
                    const student = leaveApplication.student;
                    
                    const teachesClass = await prisma.teacherClass.findFirst({
                        where: {
                            teacherId: req.user.teacher.id,
                            classId: student.classId
                        }
                    });
                    
                    const teachesSection = await prisma.teacherSection.findFirst({
                        where: {
                            teacherId: req.user.teacher.id,
                            sectionId: student.sectionId
                        }
                    });
                    
                    if (!teachesClass || !teachesSection) {
                        return next(new AppError(403, 'You do not teach this student'));
                    }
                    
                    // Check if leave is already processed
                    if (leaveApplication.status !== 'PENDING') {
                        return next(new AppError(400, 'This leave application has already been processed'));
                    }
                } else {
                    return next(new AppError(403, 'Unauthorized to update this leave application'));
                }
                break;
                
            case 'ADMIN':
                // Admins can approve/reject any leave application
                
                // Check if leave is already processed
                if (leaveApplication.status !== 'PENDING' && status !== 'CANCELLED') {
                    return next(new AppError(400, 'This leave application has already been processed'));
                }
                break;
                
            default:
                return next(new AppError(403, 'Unauthorized to update leave applications'));
        }
        
        // Update the leave application
        const updatedLeaveApplication = await prisma.leaveApplication.update({
            where: {
                id: Number(id)
            },
            data: {
                status,
                // Add remarks if provided
                ...(remarks && { description: `${leaveApplication.description}\n\nRemarks: ${remarks}` })
            },
            include: {
                leaveType: true,
                student: {
                    include: {
                        class: true,
                        section: true
                    }
                },
                teacher: {
                    include: {
                        designation: true
                    }
                }
            }
        });
        
        res.status(200).json({
            status: 'success',
            data: {
                leaveApplication: updatedLeaveApplication
            }
        });
    } catch (error) {
        console.error('Error updating leave application status:', error);
        next(error);
    }
};

// Get all leave types
export const getLeaveTypes = async (req, res, next) => {
    try {
        const leaveTypes = await prisma.leaveType.findMany();
        
        res.status(200).json({
            status: 'success',
            data: {
                leaveTypes
            }
        });
    } catch (error) {
        console.error('Error fetching leave types:', error);
        next(error);
    }
};

// Create a new leave type (admin only)
export const createLeaveType = async (req, res, next) => {
    try {
        const { name, description } = req.body;
        
        if (!name) {
            return next(new AppError(400, 'Leave type name is required'));
        }
        
        const leaveType = await prisma.leaveType.create({
            data: {
                name,
                description
            }
        });
        
        res.status(201).json({
            status: 'success',
            data: {
                leaveType
            }
        });
    } catch (error) {
        console.error('Error creating leave type:', error);
        next(error);
    }
}; 