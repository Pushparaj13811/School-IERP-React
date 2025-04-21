import { prisma } from '../databases/prismaClient.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';


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
            return next(new ApiError(400, 'Missing required fields'));
        }

        // Verify leaveType exists
        const leaveTypeExists = await prisma.leaveType.findUnique({
            where: { id: Number(leaveTypeId) }
        });

        if (!leaveTypeExists) {
            return next(new ApiError(404, 'Leave type not found'));
        }

        let leaveApplication;
        const baseData = {
            subject,
            fromDate: new Date(fromDate),
            toDate: new Date(toDate),
            description,
            status: 'PENDING',
            leaveType: {
                connect: { id: Number(leaveTypeId) }
            }
        };

        // Handle applicant type based on user role
        switch (req.user.role) {
            case 'STUDENT':
                const studentId = req.user.student.id;

                // Verify student exists
                const studentExists = await prisma.student.findUnique({
                    where: { id: studentId }
                });

                if (!studentExists) {
                    return next(new ApiError(404, 'Student record not found. Please contact admin'));
                }

                // Create student leave application with proper connect syntax
                leaveApplication = await prisma.leaveApplication.create({
                    data: {
                        ...baseData,
                        applicantType: 'STUDENT',
                        student: { connect: { id: studentId } } // Use connect instead of direct ID
                    },
                    include: {
                        leaveType: true,
                        student: {
                            include: {
                                class: true,
                                section: true
                            }
                        }
                    }
                });
                break;

            case 'TEACHER':
                const teacherId = req.user.teacher.id;

                // Verify teacher exists
                const teacherExists = await prisma.teacher.findUnique({
                    where: { id: teacherId }
                });

                if (!teacherExists) {
                    return next(new ApiError(404, 'Teacher record not found. Please contact admin'));
                }

                // Create teacher leave application with proper connect syntax
                leaveApplication = await prisma.leaveApplication.create({
                    data: {
                        ...baseData,
                        applicantType: 'TEACHER',
                        teacher: { connect: { id: teacherId } } // Use connect instead of direct ID
                    },
                    include: {
                        leaveType: true,
                        teacher: {
                            include: {
                                designation: true
                            }
                        }
                    }
                });
                break;

            case 'ADMIN':
                const adminId = req.user.admin.id;

                // Verify admin exists
                const adminExists = await prisma.admin.findUnique({
                    where: { id: adminId }
                });

                if (!adminExists) {
                    return next(new ApiError(404, 'Admin record not found. Please contact system administrator'));
                }

                // Create admin leave application with proper connect syntax
                leaveApplication = await prisma.leaveApplication.create({
                    data: {
                        ...baseData,
                        applicantType: 'ADMIN',
                        admin: { connect: { id: adminId } } // Use connect instead of direct ID
                    },
                    include: {
                        leaveType: true,
                        admin: true
                    }
                });
                break;

            default:
                return next(new ApiError(400, 'Invalid user role for leave application'));
        }

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    leaveApplication,
                    'Leave application created successfully'
                )
            );
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
            startDate,
            endDate
        } = req.query;

        const where = {};

        // Handle status filtering
        if (status) {
            // Check if status is an array and handle accordingly
            if (Array.isArray(status)) {
                where.status = {
                    in: status
                };
            } else {
                where.status = status;
            }
        }

        // Handle applicant type filtering
        if (applicantType) {
            where.applicantType = applicantType;
        }

        // Handle date range filtering (for application date)
        if (fromDate && toDate) {
            where.createdAt = {
                gte: new Date(fromDate),
                lte: new Date(toDate)
            };
        } else if (fromDate) {
            where.createdAt = {
                gte: new Date(fromDate)
            };
        } else if (toDate) {
            where.createdAt = {
                lte: new Date(toDate)
            };
        }

        // Handle date range filtering (for leave dates)
        if (startDate && endDate) {
            where.fromDate = {
                gte: new Date(startDate)
            };
            where.toDate = {
                lte: new Date(endDate)
            };
        } else if (startDate) {
            where.fromDate = {
                gte: new Date(startDate)
            };
        } else if (endDate) {
            where.toDate = {
                lte: new Date(endDate)
            };
        }

        // Handle permissions based on user role
        const userRole = req.user.role;

        if (userRole === 'STUDENT') {
            // Students can only see their own leave applications
            where.studentId = req.user.student.id;
        } else if (userRole === 'TEACHER') {
            const teacherId = req.user.teacher.id;

            // If no specific filters are set, show leaves that the teacher can approve
            if (!where.applicantType || where.applicantType === 'STUDENT') {
                // Teachers can see leaves from:
                // 1. Their own leaves
                // 2. Leaves of students in their classes/sections
                where.OR = [
                    // Teacher's own leaves
                    {
                        teacherId,
                        applicantType: 'TEACHER'
                    },
                    // Leaves of students in teacher's classes/sections
                    {
                        applicantType: 'STUDENT',
                        student: {
                            class: {
                                teacherClasses: {
                                    some: {
                                        teacherId
                                    }
                                }
                            },
                            section: {
                                teacherSections: {
                                    some: {
                                        teacherId
                                    }
                                }
                            }
                        }
                    }
                ];
            }
        }
        // Admin can see all leave applications, so no additional filtering needed

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

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    leaveApplications,
                    'Leave applications fetched successfully'
                )
            );
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
            return next(new ApiError(404, 'Leave application not found'));
        }

        // Check permissions based on role
        switch (req.user.role) {
            case 'STUDENT':
                // Students can only view their own applications
                if (
                    leaveApplication.applicantType !== 'STUDENT' ||
                    leaveApplication.studentId !== req.user.student.id
                ) {
                    return next(new ApiError(403, 'You can only view your own leave applications'));
                }
                break;

            case 'TEACHER':
                // Teachers can view their own applications or those of students they teach
                if (leaveApplication.applicantType === 'TEACHER') {
                    if (leaveApplication.teacherId !== req.user.teacher.id) {
                        return next(new ApiError(403, 'You can only view your own leave applications'));
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
                        return next(new ApiError(403, 'You do not teach this student'));
                    }
                } else {
                    return next(new ApiError(403, 'Unauthorized to view this leave application'));
                }
                break;

            case 'ADMIN':
                // Admins can view all leave applications
                break;

            default:
                return next(new ApiError(403, 'Unauthorized to view leave applications'));
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    leaveApplication,
                    'Leave application fetched successfully'
                )
            );
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
            return next(new ApiError(400, 'Invalid status. Must be APPROVED, REJECTED or CANCELLED'));
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
            return next(new ApiError(404, 'Leave application not found'));
        }

        // Check permissions based on role
        switch (req.user.role) {
            case 'STUDENT':
                // Students can only cancel their own applications
                if (
                    leaveApplication.applicantType !== 'STUDENT' ||
                    leaveApplication.studentId !== req.user.student.id
                ) {
                    return next(new ApiError(403, 'You can only update your own leave applications'));
                }

                if (status !== 'CANCELLED') {
                    return next(new ApiError(403, 'Students can only cancel leave applications'));
                }

                // Check if leave is already approved or rejected
                if (['APPROVED', 'REJECTED'].includes(leaveApplication.status)) {
                    return next(new ApiError(400, 'Cannot cancel an already processed leave application'));
                }
                break;

            case 'TEACHER':
                // Teachers can approve/reject student applications (if they teach the class)
                // Or cancel their own pending applications
                if (leaveApplication.applicantType === 'TEACHER') {
                    if (leaveApplication.teacherId !== req.user.teacher.id) {
                        return next(new ApiError(403, 'You can only update your own leave applications'));
                    }

                    if (status !== 'CANCELLED') {
                        return next(new ApiError(403, 'Teachers can only cancel their own leave applications'));
                    }

                    // Check if leave is already approved or rejected
                    if (['APPROVED', 'REJECTED'].includes(leaveApplication.status)) {
                        return next(new ApiError(400, 'Cannot cancel an already processed leave application'));
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
                        return next(new ApiError(403, 'You do not teach this student'));
                    }

                    // Check if leave is already processed
                    if (leaveApplication.status !== 'PENDING') {
                        return next(new ApiError(400, 'This leave application has already been processed'));
                    }
                } else {
                    return next(new ApiError(403, 'Unauthorized to update this leave application'));
                }
                break;

            case 'ADMIN':
                // Admins can approve/reject any leave application

                // Check if leave is already processed
                if (leaveApplication.status !== 'PENDING' && status !== 'CANCELLED') {
                    return next(new ApiError(400, 'This leave application has already been processed'));
                }
                break;

            default:
                return next(new ApiError(403, 'Unauthorized to update leave applications'));
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

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    updatedLeaveApplication,
                    'Leave application status updated successfully'
                )
            );
    } catch (error) {
        console.error('Error updating leave application status:', error);
        next(error);
    }
};

// Get all leave types
export const getLeaveTypes = async (req, res, next) => {
    try {
        const leaveTypes = await prisma.leaveType.findMany();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    leaveTypes,
                    'Leave types fetched successfully'
                )
            );
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
            return next(new ApiError(400, 'Leave type name is required'));
        }

        const leaveType = await prisma.leaveType.create({
            data: {
                name,
                description
            }
        });

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    leaveType,
                    'Leave type created successfully'
                )
            );
    } catch (error) {
        console.error('Error creating leave type:', error);
        next(error);
    }
}; 