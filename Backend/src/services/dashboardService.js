import { prisma } from '../databases/prismaClient.js';
import { AttendanceService } from './attendanceService.js';
import { ApiError } from '../utils/apiError.js';

// Initialize attendance service
const attendanceService = new AttendanceService();

/**
 * Service for fetching admin dashboard data
 */
export const getAdminDashboardData = async () => {
  // Get total counts
  const [
    studentsCount,
    teachersCount,
    parentsCount,
    classesCount,
    subjectsCount,
    sectionsCount,
    activeStudents,
    activeTeachers,
    upcomingHolidays,
    recentAnnouncements,
    leaveApplicationsPending,
    usersByRoleCounts
  ] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.parent.count(),
    prisma.class.count(),
    prisma.subject.count(), 
    prisma.section.count(),
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.holiday.findMany({
      where: {
        fromDate: {
          gt: new Date()
        }
      },
      take: 5,
      orderBy: {
        fromDate: 'asc'
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
        teacher: true,
        admin: true
      }
    }),
    prisma.leaveApplication.count({
      where: {
        status: 'PENDING'
      }
    }),
    prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true
      }
    })
  ]);

  // Process user role counts into an object
  const usersByRole = {};
  usersByRoleCounts.forEach(item => {
    usersByRole[item.role] = item._count.id;
  });

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
  
  // Mock recent activities
  const recentActivities = [
    {
      type: 'USER_CREATED',
      description: 'New users registered',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() 
    },
    {
      type: 'ANNOUNCEMENT',
      description: 'New announcements posted',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    },
    {
      type: 'CLASS_CREATED',
      description: 'New classes were added',
      timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
    }
  ];

  return {
    counts: {
      students: studentsCount,
      teachers: teachersCount,
      parents: parentsCount,
      classes: classesCount,
      pendingLeaves: leaveApplicationsPending
    },
    totalStudents: studentsCount,
    totalTeachers: teachersCount,
    totalClasses: classesCount,
    totalSubjects: subjectsCount,
    totalSections: sectionsCount,
    activeStudents,
    activeTeachers,
    usersByRole,
    studentsByGender,
    upcomingHolidays: upcomingHolidays.map(holiday => ({
      ...holiday,
      date: holiday.fromDate
    })),
    recentAnnouncements: recentAnnouncements.map(a => ({
      ...a,
      date: a.createdAt,
      creator: a.teacher ? 
        { id: a.teacher.id, name: a.teacher.name } : 
        a.admin ? 
        { id: a.admin.id, name: a.admin.fullName } : 
        { id: 0, name: 'System' }
    })),
    recentAchievements,
    recentActivities
  };
};

/**
 * Service for fetching teacher dashboard data
 */
export const getTeacherDashboardData = async (teacherId) => {
  if (!teacherId) {
    throw new ApiError(400, "Teacher ID is required");
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
      },
      profilePicture: true
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
        { teacherId: teacherId },
        {
          targetClasses: {
            some: {
              classId: {
                in: teacher.classes.map(c => c.classId)
              }
            }
          }
        },
        {
          targetRoles: {
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
      teacher: true,
      admin: true
    }
  });

  // Prepare assigned classes with student counts
  const assignedClassesPromises = teacher.classes.map(async (classAssignment) => {
    const subjectsForClass = teacher.subjects.filter(s => {
      // Find if there's a period where this teacher teaches this subject to this class
      return prisma.period.findFirst({
        where: {
          teacherId,
          classId: classAssignment.classId,
          subjectId: s.subjectId
        }
      });
    });

    const sectionsForClass = teacher.sections.filter(s => s.classId === classAssignment.classId);

    return Promise.all(sectionsForClass.map(async (sectionAssignment) => {
      return Promise.all(subjectsForClass.map(async (subjectAssignment) => {
        const studentsCount = await prisma.student.count({
          where: {
            classId: classAssignment.classId,
            sectionId: sectionAssignment.sectionId
          }
        });

        return {
          class: classAssignment.class,
          section: sectionAssignment.section,
          subject: subjectAssignment.subject,
          studentsCount
        };
      }));
    }));
  });

  // Flatten the nested arrays
  const assignedClasses = (await Promise.all(assignedClassesPromises))
    .flat(2)
    .filter(Boolean);

  // Get pending leave applications
  const pendingLeaveApplications = await prisma.leaveApplication.findMany({
    where: {
      status: 'PENDING',
      OR: [
        {
          applicantType: 'STUDENT',
          student: {
            classId: {
              in: classIds
            },
            sectionId: {
              in: sectionIds
            }
          }
        }
      ]
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          class: true,
          section: true
        }
      }
    },
    take: 10,
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Count total students and classes
  const [totalStudents, totalClasses] = await Promise.all([
    prisma.student.count({
      where: {
        classId: {
          in: teacher.classes.map(c => c.classId)
        },
        sectionId: {
          in: teacher.sections.map(s => s.sectionId)
        }
      }
    }),
    teacher.classes.length
  ]);

  // Get pending attendance days using the new method
  const pendingAttendance = await attendanceService.getPendingAttendanceDays(teacherId);
  const pendingAttendances = pendingAttendance.pendingCount;
  const pendingAttendanceDates = pendingAttendance.pendingDates;

  return {
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
      })),
      profilePicture: teacher.profilePicture?.url,
      phone: teacher.contactNo
    },
    totalStudents,
    totalClasses,
    pendingAttendances,
    pendingAttendanceDates,
    pendingLeaveRequests: pendingLeaveApplications.length,
    todayTimetable: timetable,
    pendingLeaves,
    assignedClasses,
    pendingLeaveApplications: pendingLeaveApplications.map(application => ({
      id: application.id,
      student: application.student,
      status: application.status,
      startDate: application.fromDate,
      endDate: application.toDate,
      createdAt: application.createdAt
    })),
    recentAnnouncements: announcements.map(a => ({
      id: a.id,
      title: a.title,
      content: a.content.substring(0, 100) + (a.content.length > 100 ? '...' : ''),
      date: a.createdAt,
      creator: a.teacher ? 
        { id: a.teacher.id, name: a.teacher.name } : 
        a.admin ? 
        { id: a.admin.id, name: a.admin.fullName } : 
        null
    })),
    announcements
  };
};

/**
 * Service for fetching student dashboard data
 */
export const getStudentDashboardData = async (studentId) => {
  if (!studentId) {
    throw new ApiError(400, "Student ID is required");
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
      fromDate: {
        gt: new Date()
      }
    },
    include: {
      holidayType: true
    },
    take: 3,
    orderBy: {
      fromDate: 'asc'
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
      fromDate: 'desc'
    },
    take: 5
  });

  // Get recent announcements for the student
  const announcements = await prisma.announcement.findMany({
    where: {
      OR: [
        {
          targetClasses: {
            some: {
              classId: student.classId
            }
          }
        },
        {
          targetSections: {
            some: {
              sectionId: student.sectionId
            }
          }
        },
        {
          targetRoles: {
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
    },
    include: {
      teacher: true,
      admin: true
    }
  });

  return {
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
    upcomingHolidays: upcomingHolidays.map(holiday => ({
      ...holiday,
      date: holiday.fromDate
    })),
    achievements: achievements.length,
    recentAnnouncements: announcements.map(a => ({
      id: a.id,
      title: a.title,
      content: a.content.substring(0, 100) + (a.content.length > 100 ? '...' : ''),
      date: a.createdAt
    }))
  };
};

/**
 * Service for fetching parent dashboard data
 */
export const getParentDashboardData = async (parentId) => {
  if (!parentId) {
    throw new ApiError(400, "Parent ID is required");
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

  // Get announcements and holidays for parent
  const [parentAnnouncements, parentHolidays] = await Promise.all([
    prisma.announcement.findMany({
      where: {
        OR: [
          {
            targetRoles: {
              some: {
                role: 'PARENT'
              }
            }
          },
          {
            targetRoles: {
              none: {}
            }
          }
        ]
      },
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        teacher: true,
        admin: true
      }
    }),
    prisma.holiday.findMany({
      where: {
        fromDate: {
          gt: new Date()
        }
      },
      include: {
        holidayType: true
      },
      take: 5,
      orderBy: {
        fromDate: 'asc'
      }
    })
  ]);

  return {
    parent: {
      id: parent.id,
      name: parent.name || parent.user.name,
      email: parent.email || parent.user.email,
      contactNo: parent.contactNo
    },
    children: childrenData,
    recentAnnouncements: parentAnnouncements.map(a => ({
      id: a.id,
      title: a.title,
      content: a.content.substring(0, 100) + (a.content.length > 100 ? '...' : ''),
      date: a.createdAt
    })),
    upcomingHolidays: parentHolidays.map(holiday => ({
      id: holiday.id,
      title: holiday.name,
      type: holiday.holidayType.name,
      date: holiday.fromDate,
      description: holiday.description || ''
    }))
  };
}; 