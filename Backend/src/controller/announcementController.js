import { prisma } from '../databases/prismaClient.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';


// Get all announcements
export const getAllAnnouncements = async (req, res, next) => {
    try {
        const { role } = req.user;

        // Build the query based on roles and filters
        const query = {
            where: {},
            include: {
                teacher: true,
                admin: true,
                targetClasses: {
                    include: {
                        class: true
                    }
                },
                targetSections: {
                    include: {
                        section: true
                    }
                },
                targetRoles: true,
                attachments: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        };

        // Apply filters if provided
        if (req.query.isActive) {
            if (req.query.isActive === 'true') {
                query.where.isActive = true;
            } else if (req.query.isActive === 'false') {
                query.where.isActive = false;
            }
        }

        // Apply role-based filtering (optional)
        if (role !== 'ADMIN') {
            // For non-admin users, show announcements targeted to their role
            query.where.OR = [
                { targetRoles: { some: { role } } },
                { targetRoles: { none: {} } } // Announcements with no specific role targets
            ];
        }

        const announcements = await prisma.announcement.findMany(query);

        // Format data for response
        const formattedAnnouncements = announcements.map(announcement => {
            // Get creator name and role
            let creatorName = "Unknown";
            let creatorRole = announcement.createdByRole;

            if (announcement.teacher) {
                creatorName = announcement.teacher.name;
            } else if (announcement.admin) {
                creatorName = announcement.admin.fullName;
            }

            return {
                id: announcement.id,
                title: announcement.title,
                content: announcement.content,
                priority: announcement.priority,
                createdAt: announcement.createdAt,
                updatedAt: announcement.updatedAt,
                expiresAt: announcement.expiresAt,
                isActive: announcement.isActive,
                createdBy: {
                    name: creatorName,
                    role: creatorRole
                },
                targetClasses: announcement.targetClasses.map(tc => tc.class.name),
                targetSections: announcement.targetSections.map(ts => ts.section.name),
                targetRoles: announcement.targetRoles.map(tr => tr.role),
                attachments: announcement.attachments.map(attachment => ({
                    id: attachment.id,
                    name: attachment.fileName,
                    url: attachment.fileUrl,
                    type: attachment.fileType,
                    size: attachment.fileSize
                }))
            };
        });

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    formattedAnnouncements,
                    'Announcements fetched successfully'
                )
            );
    } catch (error) {
        next(error);
    }
};

// Get a single announcement
export const getAnnouncementById = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if the ID is valid
        if (!id || isNaN(Number(id))) {
            return next(new ApiError(400, 'Invalid announcement ID'));
        }

        const announcement = await prisma.announcement.findUnique({
            where: { id: Number(id) },
            include: {
                teacher: true,
                admin: true,
                targetClasses: {
                    include: {
                        class: true
                    }
                },
                targetSections: {
                    include: {
                        section: true
                    }
                },
                targetRoles: true,
                attachments: true
            }
        });

        if (!announcement) {
            return next(new ApiError(404, 'Announcement not found'));
        }

        // Get creator name and role
        let creatorName = "Unknown";
        let creatorRole = announcement.createdByRole;

        if (announcement.teacher) {
            creatorName = announcement.teacher.name;
        } else if (announcement.admin) {
            creatorName = announcement.admin.fullName;
        }

        // Format the announcement for response
        const formattedAnnouncement = {
            id: announcement.id,
            title: announcement.title,
            content: announcement.content,
            priority: announcement.priority,
            createdAt: announcement.createdAt,
            updatedAt: announcement.updatedAt,
            expiresAt: announcement.expiresAt,
            isActive: announcement.isActive,
            createdBy: {
                name: creatorName,
                role: creatorRole
            },
            targetClasses: announcement.targetClasses.map(tc => ({
                id: tc.classId,
                name: tc.class.name
            })),
            targetSections: announcement.targetSections.map(ts => ({
                id: ts.sectionId,
                name: ts.section.name
            })),
            targetRoles: announcement.targetRoles.map(tr => tr.role),
            attachments: announcement.attachments.map(attachment => ({
                id: attachment.id,
                name: attachment.fileName,
                url: attachment.fileUrl,
                type: attachment.fileType,
                size: attachment.fileSize
            }))
        };

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    formattedAnnouncement,
                    'Announcement fetched successfully'
                )
            );
    } catch (error) {
        next(error);
    }
};

// Create a new announcement
export const createAnnouncement = async (req, res, next) => {
    try {
        const {
            title,
            content,
            priority = 'NORMAL',
            expiresAt = null,
            targetClassIds = [],
            targetSectionIds = [],
            targetRoles = [],
        } = req.body;

        const files = req.files;
        const processedAttachments = [];

        if (files && files.length > 0) {
            for (const file of files) {
                const host = req.headers.host;
                const protocol = req.secure ? 'https' : 'http';
                const fileUrl = `${protocol}://${host}/uploads/announcements/${file.filename}`;
                processedAttachments.push({
                    name: file.originalname,
                    url: fileUrl,
                    type: file.mimetype,
                    size: file.size
                });
            }
        }

        const { id: userId, role: userRole } = req.user;

        // Get creator IDs based on role
        let teacherId = null;
        let adminId = null;

        if (userRole === 'TEACHER') {
            const teacher = await prisma.teacher.findFirst({
                where: {
                    user: {
                        id: userId
                    }
                }
            });

            if (!teacher) {
                return next(new ApiError(404, 'Teacher profile not found'));
            }

            teacherId = teacher.id;
        } else if (userRole === 'ADMIN') {
            const admin = await prisma.admin.findFirst({
                where: {
                    user: {
                        id: userId
                    }
                }
            });

            if (!admin) {
                return next(new ApiError(404, 'Admin profile not found'));
            }

            adminId = admin.id;
        } else {
            return next(new ApiError(403, 'Only teachers and admins can create announcements'));
        }

        // Create the announcement
        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                priority,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                isActive: true,
                createdById: userId,
                createdByRole: userRole,
                teacherId,
                adminId,
                targetClasses: {
                    create: targetClassIds.map(classId => ({
                        class: {
                            connect: { id: Number(classId) }
                        }
                    }))
                },
                targetSections: {
                    create: targetSectionIds.map(sectionId => ({
                        section: {
                            connect: { id: Number(sectionId) }
                        }
                    }))
                },
                targetRoles: {
                    create: targetRoles.map(role => ({
                        role
                    }))
                },
                attachments: {
                    create: processedAttachments.map(attachment => ({
                        fileName: attachment.name,
                        fileUrl: attachment.url,
                        fileType: attachment.type,
                        fileSize: attachment.size
                    }))
                }
            },
            include: {
                teacher: true,
                admin: true,
                targetClasses: {
                    include: {
                        class: true
                    }
                },
                targetSections: {
                    include: {
                        section: true
                    }
                },
                targetRoles: true,
                attachments: true
            }
        });

        // Format for response
        const formattedAnnouncement = {
            id: announcement.id,
            title: announcement.title,
            content: announcement.content,
            priority: announcement.priority,
            createdAt: announcement.createdAt,
            updatedAt: announcement.updatedAt,
            expiresAt: announcement.expiresAt,
            isActive: announcement.isActive,
            createdBy: {
                name: announcement.teacher?.name || announcement.admin?.fullName || 'Unknown',
                role: announcement.createdByRole
            },
            targetClasses: announcement.targetClasses.map(tc => ({
                id: tc.classId,
                name: tc.class.name
            })),
            targetSections: announcement.targetSections.map(ts => ({
                id: ts.sectionId,
                name: ts.section.name
            })),
            targetRoles: announcement.targetRoles.map(tr => tr.role),
            attachments: announcement.attachments.map(attachment => ({
                id: attachment.id,
                name: attachment.fileName,
                url: attachment.fileUrl,
                type: attachment.fileType,
                size: attachment.fileSize
            }))
        };

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    formattedAnnouncement,
                    'Announcement created successfully'
                )
            );
    } catch (error) {
        console.error('Error creating announcement:', error);
        next(error);
    }
};

// Update an announcement
export const updateAnnouncement = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            title,
            content,
            priority,
            expiresAt,
            isActive,
            targetClassIds = [],
            targetSectionIds = [],
            targetRoles = [],
            attachments = []
        } = req.body;

        // Process new file uploads
        const files = req.files;
        const newAttachments = [];

        if (files && files.length > 0) {
            for (const file of files) {
                const host = req.headers.host;
                const protocol = req.secure ? 'https' : 'http';
                const fileUrl = `${protocol}://${host}/uploads/announcements/${file.filename}`;
                newAttachments.push({
                    name: file.originalname,
                    url: fileUrl,
                    type: file.mimetype,
                    size: file.size
                });
            }
        }

        // Check if the announcement exists
        const announcementExists = await prisma.announcement.findUnique({
            where: { id: Number(id) }
        });

        if (!announcementExists) {
            return next(new ApiError(404, 'Announcement not found'));
        }

        // Check if the user has permission to update this announcement
        const { role: userRole, id: userId } = req.user;

        if (userRole !== 'ADMIN') {
            // For non-admin users, check if they created the announcement
            if (announcementExists.createdById !== userId) {
                return next(new ApiError(403, 'You do not have permission to update this announcement'));
            }
        }

        // Prepare update data
        const updateData = {
            ...(title && { title }),
            ...(content && { content }),
            ...(priority && { priority }),
            ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
            ...(isActive !== undefined && { isActive }),
            updatedAt: new Date()
        };

        // Perform the update using a transaction to handle relations
        const updated = await prisma.$transaction(async (tx) => {
            // Update the announcement itself
            const updatedAnnouncement = await tx.announcement.update({
                where: { id: Number(id) },
                data: updateData
            });

            // If targetClassIds is provided, update class relations
            if (targetClassIds.length >= 0) {
                // Delete existing relations
                await tx.announcementClass.deleteMany({
                    where: { announcementId: Number(id) }
                });

                // Create new relations
                if (targetClassIds.length > 0) {
                    await Promise.all(targetClassIds.map(classId =>
                        tx.announcementClass.create({
                            data: {
                                announcementId: Number(id),
                                classId: Number(classId)
                            }
                        })
                    ));
                }
            }

            // If targetSectionIds is provided, update section relations
            if (targetSectionIds.length >= 0) {
                // Delete existing relations
                await tx.announcementSection.deleteMany({
                    where: { announcementId: Number(id) }
                });

                // Create new relations
                if (targetSectionIds.length > 0) {
                    await Promise.all(targetSectionIds.map(sectionId =>
                        tx.announcementSection.create({
                            data: {
                                announcementId: Number(id),
                                sectionId: Number(sectionId)
                            }
                        })
                    ));
                }
            }

            // If targetRoles is provided, update role relations
            if (targetRoles.length >= 0) {
                // Delete existing relations
                await tx.announcementRole.deleteMany({
                    where: { announcementId: Number(id) }
                });

                // Create new relations
                if (targetRoles.length > 0) {
                    await Promise.all(targetRoles.map(role =>
                        tx.announcementRole.create({
                            data: {
                                announcementId: Number(id),
                                role
                            }
                        })
                    ));
                }
            }

            // Process file attachments if there are any new ones
            if (newAttachments.length > 0) {
                // Create new attachments
                await Promise.all(newAttachments.map(attachment =>
                    tx.announcementAttachment.create({
                        data: {
                            announcementId: Number(id),
                            fileName: attachment.name,
                            fileUrl: attachment.url,
                            fileType: attachment.type,
                            fileSize: attachment.size
                        }
                    })
                ));
            }

            // Handle existing attachments that should be kept
            if (attachments && attachments.length > 0) {
                // First get all current attachment IDs
                const currentAttachments = await tx.announcementAttachment.findMany({
                    where: { announcementId: Number(id) },
                    select: { id: true }
                });
                
                const currentAttachmentIds = currentAttachments.map(a => a.id);
                const keepAttachmentIds = attachments.map(a => Number(a.id));
                
                // Delete attachments that are no longer needed
                const attachmentsToDelete = currentAttachmentIds.filter(id => !keepAttachmentIds.includes(id));
                
                if (attachmentsToDelete.length > 0) {
                    await tx.announcementAttachment.deleteMany({
                        where: {
                            id: { in: attachmentsToDelete }
                        }
                    });
                }
            }

            return updatedAnnouncement;
        });

        // Fetch the updated announcement with all relations
        const updatedAnnouncement = await prisma.announcement.findUnique({
            where: { id: Number(id) },
            include: {
                teacher: true,
                admin: true,
                targetClasses: {
                    include: {
                        class: true
                    }
                },
                targetSections: {
                    include: {
                        section: true
                    }
                },
                targetRoles: true,
                attachments: true
            }
        });

        // Format for response
        const formattedAnnouncement = {
            id: updatedAnnouncement.id,
            title: updatedAnnouncement.title,
            content: updatedAnnouncement.content,
            priority: updatedAnnouncement.priority,
            createdAt: updatedAnnouncement.createdAt,
            updatedAt: updatedAnnouncement.updatedAt,
            expiresAt: updatedAnnouncement.expiresAt,
            isActive: updatedAnnouncement.isActive,
            createdBy: {
                name: updatedAnnouncement.teacher?.name || updatedAnnouncement.admin?.fullName || 'Unknown',
                role: updatedAnnouncement.createdByRole
            },
            targetClasses: updatedAnnouncement.targetClasses.map(tc => ({
                id: tc.classId,
                name: tc.class.name
            })),
            targetSections: updatedAnnouncement.targetSections.map(ts => ({
                id: ts.sectionId,
                name: ts.section.name
            })),
            targetRoles: updatedAnnouncement.targetRoles.map(tr => tr.role),
            attachments: updatedAnnouncement.attachments.map(attachment => ({
                id: attachment.id,
                name: attachment.fileName,
                url: attachment.fileUrl,
                type: attachment.fileType,
                size: attachment.fileSize
            }))
        };

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    formattedAnnouncement,
                    'Announcement updated successfully'
                )
            );
    } catch (error) {
        console.error('Error updating announcement:', error);
        next(error);
    }
};

// Delete an announcement
export const deleteAnnouncement = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if the announcement exists
        const announcementExists = await prisma.announcement.findUnique({
            where: { id: Number(id) }
        });

        if (!announcementExists) {
            return next(new ApiError(404, 'Announcement not found'));
        }

        // Check if the user has permission to delete this announcement
        const { role: userRole, id: userId } = req.user;

        if (userRole !== 'ADMIN') {
            // For non-admin users, check if they created the announcement
            if (announcementExists.createdById !== userId) {
                return next(new ApiError(403, 'You do not have permission to delete this announcement'));
            }
        }

        // Delete related records
        await prisma.$transaction([
            prisma.announcementClass.deleteMany({
                where: { announcementId: Number(id) }
            }),
            prisma.announcementSection.deleteMany({
                where: { announcementId: Number(id) }
            }),
            prisma.announcementRole.deleteMany({
                where: { announcementId: Number(id) }
            }),
            prisma.announcementAttachment.deleteMany({
                where: { announcementId: Number(id) }
            }),
            prisma.announcement.delete({
                where: { id: Number(id) }
            })
        ]);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    'Announcement deleted successfully'
                )
            );
    } catch (error) {
        console.error('Error deleting announcement:', error);
        next(error);
    }
}; 