import { prisma } from '../databases/prismaClient.js';
import { ApiError } from '../utils/apiError.js';

/**
 * Create new feedback
 */
export const createFeedback = async (data, user) => {
    const { feedbackType, subject, description } = data;

    // Find or create feedback type
    let feedbackTypeRecord = await prisma.feedbackType.findFirst({
        where: { name: feedbackType }
    });

    if (!feedbackTypeRecord) {
        feedbackTypeRecord = await prisma.feedbackType.create({
            data: { name: feedbackType }
        });
    }

    // Determine which user type is submitting
    const feedbackData = {
        subject,
        description,
        feedbackTypeId: feedbackTypeRecord.id
    };

    // Set the appropriate foreign key based on user role
    if (user.role === 'STUDENT' && user.student) {
        feedbackData.studentId = user.student.id;
    } else if (user.role === 'TEACHER' && user.teacher) {
        feedbackData.teacherId = user.teacher.id;
    } else if (user.role === 'PARENT' && user.parent) {
        feedbackData.parentId = user.parent.id;
    } else if (user.role === 'ADMIN' && user.admin) {
        feedbackData.adminId = user.admin.id;
    }

    const feedback = await prisma.feedback.create({
        data: feedbackData,
        include: {
            feedbackType: true,
            student: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
            teacher: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
            parent: { select: { id: true, user: { select: { firstName: true, lastName: true } } } }
        }
    });

    return feedback;
};

/**
 * Get all feedback (admin only)
 */
export const getAllFeedback = async (filters = {}) => {
    const { feedbackType, startDate, endDate, page = 1, limit = 20 } = filters;

    const where = {};

    if (feedbackType) {
        where.feedbackType = { name: feedbackType };
    }

    if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [feedbacks, total] = await Promise.all([
        prisma.feedback.findMany({
            where,
            include: {
                feedbackType: true,
                student: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
                teacher: { select: { id: true, user: { select: { firstName: true, lastName: true } } } },
                parent: { select: { id: true, user: { select: { firstName: true, lastName: true } } } }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: parseInt(limit)
        }),
        prisma.feedback.count({ where })
    ]);

    return {
        feedbacks,
        pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Get user's own feedback
 */
export const getUserFeedback = async (user) => {
    const where = {};

    if (user.role === 'STUDENT' && user.student) {
        where.studentId = user.student.id;
    } else if (user.role === 'TEACHER' && user.teacher) {
        where.teacherId = user.teacher.id;
    } else if (user.role === 'PARENT' && user.parent) {
        where.parentId = user.parent.id;
    }

    const feedbacks = await prisma.feedback.findMany({
        where,
        include: {
            feedbackType: true
        },
        orderBy: { createdAt: 'desc' }
    });

    return feedbacks;
};

/**
 * Get all feedback types
 */
export const getFeedbackTypes = async () => {
    return prisma.feedbackType.findMany({
        orderBy: { name: 'asc' }
    });
};

/**
 * Delete feedback (admin only or owner)
 */
export const deleteFeedback = async (feedbackId, user) => {
    const feedback = await prisma.feedback.findUnique({
        where: { id: parseInt(feedbackId) }
    });

    if (!feedback) {
        throw new ApiError(404, 'Feedback not found');
    }

    // Check ownership or admin
    const isOwner =
        (user.role === 'STUDENT' && user.student?.id === feedback.studentId) ||
        (user.role === 'TEACHER' && user.teacher?.id === feedback.teacherId) ||
        (user.role === 'PARENT' && user.parent?.id === feedback.parentId);

    if (!isOwner && user.role !== 'ADMIN') {
        throw new ApiError(403, 'Not authorized to delete this feedback');
    }

    await prisma.feedback.delete({
        where: { id: parseInt(feedbackId) }
    });

    return { message: 'Feedback deleted successfully' };
};
