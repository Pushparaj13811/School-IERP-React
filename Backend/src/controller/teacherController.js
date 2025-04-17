// Add these controller methods for class teacher assignments
export const assignClassTeacher = async (req, res, next) => {
    try {
        const { teacherId, classId, sectionId } = req.body;
        
        if (!teacherId || !classId || !sectionId) {
            return next(new AppError(400, 'Teacher ID, Class ID, and Section ID are required'));
        }
        
        // Verify the teacher exists
        const teacher = await prisma.teacher.findUnique({
            where: { id: parseInt(teacherId) }
        });
        
        if (!teacher) {
            return next(new AppError(404, 'Teacher not found'));
        }
        
        // Verify the class exists
        const classRecord = await prisma.class.findUnique({
            where: { id: parseInt(classId) }
        });
        
        if (!classRecord) {
            return next(new AppError(404, 'Class not found'));
        }
        
        // Verify the section exists and belongs to the class
        const section = await prisma.section.findFirst({
            where: { 
                id: parseInt(sectionId),
                classId: parseInt(classId)
            }
        });
        
        if (!section) {
            return next(new AppError(404, 'Section not found or does not belong to the specified class'));
        }
        
        // Check if there's already a class teacher assigned
        const existingAssignment = await prisma.classTeacherAssignment.findFirst({
            where: {
                classId: parseInt(classId),
                sectionId: parseInt(sectionId)
            },
            include: {
                teacher: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
        
        let result;
        
        if (existingAssignment) {
            // Update the existing assignment
            result = await prisma.classTeacherAssignment.update({
                where: {
                    id: existingAssignment.id
                },
                data: {
                    teacherId: parseInt(teacherId)
                },
                include: {
                    teacher: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            designation: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    class: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    section: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });
            
            return res.status(200).json({
                status: 'success',
                message: `Class teacher reassigned from ${existingAssignment.teacher.name} to ${teacher.name}`,
                data: { assignment: result }
            });
        } else {
            // Create a new assignment
            result = await prisma.classTeacherAssignment.create({
                data: {
                    teacherId: parseInt(teacherId),
                    classId: parseInt(classId),
                    sectionId: parseInt(sectionId)
                },
                include: {
                    teacher: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            designation: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    },
                    class: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    section: {
                        select: {
                            id: true,
                            name: true
                        }
                    }
                }
            });
            
            return res.status(201).json({
                status: 'success',
                message: 'Class teacher assigned successfully',
                data: { assignment: result }
            });
        }
    } catch (error) {
        console.error('Error assigning class teacher:', error);
        next(error);
    }
};

export const getAllClassTeacherAssignments = async (req, res, next) => {
    try {
        const { classId, sectionId, teacherId } = req.query;
        
        // Build the query conditions
        const whereCondition = {};
        
        if (classId) {
            whereCondition.classId = parseInt(classId);
        }
        
        if (sectionId) {
            whereCondition.sectionId = parseInt(sectionId);
        }
        
        if (teacherId) {
            whereCondition.teacherId = parseInt(teacherId);
        }
        
        const assignments = await prisma.classTeacherAssignment.findMany({
            where: whereCondition,
            include: {
                teacher: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        designation: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                class: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                section: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: [
                { classId: 'asc' },
                { sectionId: 'asc' }
            ]
        });
        
        return res.status(200).json({
            status: 'success',
            results: assignments.length,
            data: { assignments }
        });
    } catch (error) {
        console.error('Error fetching class teacher assignments:', error);
        next(error);
    }
};

export const removeClassTeacherAssignment = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return next(new AppError(400, 'Assignment ID is required'));
        }
        
        // Check if the assignment exists
        const assignment = await prisma.classTeacherAssignment.findUnique({
            where: { id: parseInt(id) },
            include: {
                teacher: {
                    select: {
                        name: true
                    }
                },
                class: {
                    select: {
                        name: true
                    }
                },
                section: {
                    select: {
                        name: true
                    }
                }
            }
        });
        
        if (!assignment) {
            return next(new AppError(404, 'Class teacher assignment not found'));
        }
        
        // Delete the assignment
        await prisma.classTeacherAssignment.delete({
            where: { id: parseInt(id) }
        });
        
        return res.status(200).json({
            status: 'success',
            message: `Class teacher ${assignment.teacher.name} removed from ${assignment.class.name} ${assignment.section.name}`
        });
    } catch (error) {
        console.error('Error removing class teacher assignment:', error);
        next(error);
    }
}; 