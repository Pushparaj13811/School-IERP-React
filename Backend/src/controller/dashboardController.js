import { prisma } from '../databases/prismaClient.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';

/**
 * Get Admin Dashboard data
 * @route GET /api/v1/dashboard/admin
 * @access Private (Admin only)
 */
const getAdminDashboard = asyncHandler(async (req, res) => {
    try {
        // Get total counts
        const [
            studentsCount,
            teachersCount,
            parentsCount,
            classesCount,
            upcomingHolidays,
            recentAnnouncements,
            leaveApplicationsPending
        ] = await Promise.all([
            prisma.student.count(),
            prisma.teacher.count(),
            prisma.parent.count(),
            prisma.class.count(),
            prisma.holiday.findMany({
                where: {
                    date: {
                        gt: new Date()
                    }
                },
                take: 5,
                orderBy: {
                    date: 'asc'
                },
                include: {
                    holidayType: true
                }
            }),
            prisma.announcement.findMany({
                take: 5,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    creator: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            }),
            prisma.leaveApplication.count({
                where: {
                    status: 'PENDING'
                }
            })
        ]);

        // Calculate gender distribution for students
        const studentsByGender = await prisma.student.groupBy({
            by: ['gender'],
            _count: {
                id: true
            }
        });

        // Get recent 5 achievements
        const recentAchievements = await prisma.achievement.findMany({
            take: 5,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                student: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                teacher: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                achievementType: true
            }
        });

        // Return dashboard data
        return res.status(200).json(
            new ApiResponse(200, {
                counts: {
                    students: studentsCount,
                    teachers: teachersCount,
                    parents: parentsCount,
                    classes: classesCount,
                    pendingLeaves: leaveApplicationsPending
                },
                studentsByGender,
                upcomingHolidays,
                recentAnnouncements,
                recentAchievements
            }, "Admin dashboard data fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Error fetching admin dashboard data", error);
    }
});

/**
 * Get Teacher Dashboard data
 * @route GET /api/v1/dashboard/teacher
 * @access Private (Teacher only)
 */
const getTeacherDashboard = asyncHandler(async (req, res) => {
    try {
        const teacherId = req.user.teacher?.id;

        if (!teacherId) {
            throw new ApiError(400, "Teacher ID not found");
        }

        // Get teacher details with all relations
        const teacher = await prisma.teacher.findUnique({
            where: {
                id: teacherId
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
                sections: {
                    include: {
                        section: true
                    }
                },
                classTeacherAssignments: {
                    include: {
                        class: true,
                        section: true
                    }
                }
            }
        });

        if (!teacher) {
            throw new ApiError(404, "Teacher not found");
        }

        // Get today's timetable
        const today = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
        const timetable = await prisma.period.findMany({
            where: {
                teacherId,
                dayOfWeek: today
            },
            include: {
                timeSlot: true,
                subject: true,
                class: true,
                section: true
            },
            orderBy: {
                timeSlot: {
                    startTime: 'asc'
                }
            }
        });

        // Get pending leave applications for approval (for class teachers)
        const classIds = teacher.classTeacherAssignments.map(assignment => assignment.classId);
        const sectionIds = teacher.classTeacherAssignments.map(assignment => assignment.sectionId);

        let pendingLeaves = [];
        if (classIds.length > 0) {
            pendingLeaves = await prisma.leaveApplication.findMany({
                where: {
                    student: {
                        classId: {
                            in: classIds
                        },
                        sectionId: {
                            in: sectionIds
                        }
                    },
                    status: 'PENDING'
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            class: true,
                            section: true
                        }
                    },
                    leaveType: true
                },
                take: 10,
                orderBy: {
                    createdAt: 'desc'
                }
            });
        }

        // Get recent announcements
        const announcements = await prisma.announcement.findMany({
            where: {
                OR: [
                    { creatorId: teacherId },
                    {
                        classes: {
                            some: {
                                classId: {
                                    in: teacher.classes.map(c => c.classId)
                                }
                            }
                        }
                    },
                    {
                        roles: {
                            some: {
                                role: 'TEACHER'
                            }
                        }
                    }
                ]
            },
            take: 5,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        // Return dashboard data
        return res.status(200).json(
            new ApiResponse(200, {
                teacher: {
                    id: teacher.id,
                    name: teacher.name,
                    email: teacher.email,
                    designation: teacher.designation,
                    subjects: teacher.subjects.map(s => s.subject),
                    assignedClasses: teacher.classes.map(c => c.class),
                    assignedSections: teacher.sections.map(s => s.section),
                    classTeacherOf: teacher.classTeacherAssignments.map(a => ({
                        class: a.class,
                        section: a.section
                    }))
                },
                todayTimetable: timetable,
                pendingLeaves,
                announcements
            }, "Teacher dashboard data fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Error fetching teacher dashboard data", error);
    }
});

/**
 * Get Student Dashboard data
 * @route GET /api/v1/dashboard/student
 * @access Private (Student only)
 */
const getStudentDashboard = asyncHandler(async (req, res) => {
    try {
        const studentId = req.user.student?.id;

        if (!studentId) {
            throw new ApiError(400, "Student ID not found");
        }

        // Get student details with all relations
        const student = await prisma.student.findUnique({
            where: {
                id: studentId
            },
            include: {
                user: true,
                class: true,
                section: true,
                profilePicture: true
            }
        });

        if (!student) {
            throw new ApiError(404, "Student not found");
        }

        // Get today's timetable
        const today = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
        const timetable = await prisma.period.findMany({
            where: {
                classId: student.classId,
                sectionId: student.sectionId,
                dayOfWeek: today
            },
            include: {
                timeSlot: true,
                subject: true,
                teacher: true
            },
            orderBy: {
                timeSlot: {
                    startTime: 'asc'
                }
            }
        });

        // Get recent attendance
        const currentDate = new Date();
        const pastThirtyDays = new Date(currentDate);
        pastThirtyDays.setDate(pastThirtyDays.getDate() - 30);

        const attendance = await prisma.dailyAttendance.findMany({
            where: {
                studentId,
                date: {
                    gte: pastThirtyDays,
                    lte: currentDate
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        // Calculate attendance percentage
        const totalDays = attendance.length;
        const presentDays = attendance.filter(a => a.status === 'PRESENT').length;
        const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

        // Get recent exam results
        const examResults = await prisma.subjectResult.findMany({
            where: {
                studentId
            },
            include: {
                subject: true
            },
            take: 5,
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Get upcoming holidays
        const upcomingHolidays = await prisma.holiday.findMany({
            where: {
                date: {
                    gt: new Date()
                }
            },
            include: {
                holidayType: true
            },
            take: 3,
            orderBy: {
                date: 'asc'
            }
        });

        // Get student achievements
        const achievements = await prisma.achievement.findMany({
            where: {
                studentId
            },
            include: {
                achievementType: true
            },
            orderBy: {
                date: 'desc'
            },
            take: 5
        });

        // Get recent announcements for the student
        const announcements = await prisma.announcement.findMany({
            where: {
                OR: [
                    {
                        classes: {
                            some: {
                                classId: student.classId
                            }
                        }
                    },
                    {
                        sections: {
                            some: {
                                sectionId: student.sectionId
                            }
                        }
                    },
                    {
                        roles: {
                            some: {
                                role: 'STUDENT'
                            }
                        }
                    }
                ]
            },
            take: 5,
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Return dashboard data
        return res.status(200).json(
            new ApiResponse(200, {
                student: {
                    id: student.id,
                    name: student.name,
                    rollNo: student.rollNo,
                    class: student.class,
                    section: student.section,
                    profilePicture: student.profilePicture?.url || null
                },
                attendancePercentage,
                todayTimetable: timetable,
                examResults,
                upcomingHolidays,
                achievements: achievements.length,
                recentAnnouncements: announcements.map(a => ({
                    id: a.id,
                    title: a.title,
                    content: a.content.substring(0, 100) + (a.content.length > 100 ? '...' : ''),
                    date: a.createdAt
                }))
            }, "Student dashboard data fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Error fetching student dashboard data", error);
    }
});

/**
 * Get Parent Dashboard data
 * @route GET /api/v1/dashboard/parent
 * @access Private (Parent only)
 */
const getParentDashboard = asyncHandler(async (req, res) => {
    try {
        const parentId = req.user.parent?.id;

        if (!parentId) {
            throw new ApiError(400, "Parent ID not found");
        }

        // Get parent details with children
        const parent = await prisma.parent.findUnique({
            where: {
                id: parentId
            },
            include: {
                user: true,
                children: {
                    include: {
                        class: true,
                        section: true,
                        profilePicture: true
                    }
                }
            }
        });

        if (!parent) {
            throw new ApiError(404, "Parent not found");
        }

        // For each child, get attendance and recent results
        const childrenData = await Promise.all(parent.children.map(async (child) => {
            // Get attendance percentage
            const currentDate = new Date();
            const pastThirtyDays = new Date(currentDate);
            pastThirtyDays.setDate(pastThirtyDays.getDate() - 30);

            const attendance = await prisma.dailyAttendance.findMany({
                where: {
                    studentId: child.id,
                    date: {
                        gte: pastThirtyDays,
                        lte: currentDate
                    }
                }
            });

            const totalDays = attendance.length;
            const presentDays = attendance.filter(a => a.status === 'PRESENT').length;
            const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

            // Get recent results
            const examResults = await prisma.subjectResult.findMany({
                where: {
                    studentId: child.id
                },
                include: {
                    subject: true
                },
                take: 3,
                orderBy: {
                    createdAt: 'desc'
                }
            });

            // Get leave applications
            const leaveApplications = await prisma.leaveApplication.findMany({
                where: {
                    studentId: child.id
                },
                take: 5,
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    leaveType: true
                }
            });

            return {
                student: {
                    id: child.id,
                    name: child.name,
                    rollNo: child.rollNo,
                    class: child.class.name,
                    section: child.section.name,
                    profilePicture: child.profilePicture?.url || null
                },
                attendancePercentage,
                recentResults: examResults.map(result => ({
                    subject: result.subject.name,
                    marks: result.marksObtained,
                    totalMarks: result.totalMarks,
                    grade: result.grade,
                    date: result.createdAt
                })),
                leaveApplications: leaveApplications.map(app => ({
                    id: app.id,
                    leaveType: app.leaveType.name,
                    fromDate: app.fromDate,
                    toDate: app.toDate,
                    status: app.status,
                    reason: app.reason
                }))
            };
        }));

        // Get announcements relevant to any of the children
        const childClassIds = parent.children.map(child => child.classId);
        const childSectionIds = parent.children.map(child => child.sectionId);

        const announcements = await prisma.announcement.findMany({
            where: {
                OR: [
                    {
                        classes: {
                            some: {
                                classId: {
                                    in: childClassIds
                                }
                            }
                        }
                    },
                    {
                        sections: {
                            some: {
                                sectionId: {
                                    in: childSectionIds
                                }
                            }
                        }
                    },
                    {
                        roles: {
                            some: {
                                role: 'PARENT'
                            }
                        }
                    }
                ]
            },
            take: 5,
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Get upcoming holidays
        const upcomingHolidays = await prisma.holiday.findMany({
            where: {
                date: {
                    gt: new Date()
                }
            },
            take: 3,
            orderBy: {
                date: 'asc'
            },
            include: {
                holidayType: true
            }
        });

        // Return dashboard data
        return res.status(200).json(
            new ApiResponse(200, {
                parent: {
                    id: parent.id,
                    name: parent.name,
                    email: parent.email,
                    contactNo: parent.contactNo
                },
                children: childrenData,
                recentAnnouncements: announcements.map(a => ({
                    id: a.id,
                    title: a.title,
                    content: a.content.substring(0, 100) + (a.content.length > 100 ? '...' : ''),
                    date: a.createdAt
                })),
                upcomingHolidays: upcomingHolidays.map(h => ({
                    id: h.id,
                    title: h.title,
                    type: h.holidayType.name,
                    date: h.date,
                    description: h.description
                }))
            }, "Parent dashboard data fetched successfully")
        );
    } catch (error) {
        throw new ApiError(500, "Error fetching parent dashboard data", error);
    }
});

export {
    getAdminDashboard,
    getTeacherDashboard,
    getStudentDashboard,
    getParentDashboard
}; 