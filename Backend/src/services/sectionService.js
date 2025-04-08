import { prisma } from '../databases/prismaClient.js';
import { AppError } from '../middlewares/errorHandler.js';

export class SectionService {
    async createSection(data) {
        try {
            // Check if class exists
            const classExists = await prisma.class.findUnique({
                where: { id: parseInt(data.classId) }
            });

            if (!classExists) {
                throw new AppError(404, 'Class not found');
            }

            // Check if section with same name already exists in the class
            const existingSection = await prisma.section.findFirst({
                where: {
                    classId: parseInt(data.classId),
                    name: data.name
                }
            });

            if (existingSection) {
                throw new AppError(400, 'Section with this name already exists in this class');
            }

            const newSection = await prisma.section.create({
                data: {
                    name: data.name,
                    classId: parseInt(data.classId)
                }
            });
            return newSection;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(500, 'Failed to create section');
        }
    }

    async getAllSections() {
        try {
            const sections = await prisma.section.findMany({
                include: {
                    class: true,
                    students: true
                }
            });
            return sections;
        } catch (error) {
            throw new AppError(500, 'Failed to fetch sections');
        }
    }

    async getSectionById(id) {
        try {
            const section = await prisma.section.findUnique({
                where: { id: parseInt(id) },
                include: {
                    class: true,
                    students: true
                }
            });

            if (!section) {
                throw new AppError(404, 'Section not found');
            }

            return section;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(500, 'Failed to fetch section');
        }
    }

    async updateSection(id, data) {
        try {
            // Check if section exists
            const section = await prisma.section.findUnique({
                where: { id: parseInt(id) }
            });

            if (!section) {
                throw new AppError(404, 'Section not found');
            }

            // If name is being updated, check for duplicates
            if (data.name && data.name !== section.name) {
                const existingSection = await prisma.section.findFirst({
                    where: {
                        classId: section.classId,
                        name: data.name,
                        id: { not: parseInt(id) }
                    }
                });

                if (existingSection) {
                    throw new AppError(400, 'Section with this name already exists in this class');
                }
            }

            const updatedSection = await prisma.section.update({
                where: { id: parseInt(id) },
                data: {
                    name: data.name,
                    classId: data.classId ? parseInt(data.classId) : undefined
                }
            });
            return updatedSection;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(500, 'Failed to update section');
        }
    }

    async deleteSection(id) {
        try {
            await prisma.section.delete({
                where: { id: parseInt(id) }
            });
            return { message: 'Section deleted successfully' };
        } catch (error) {
            if (error.code === 'P2025') {
                throw new AppError(404, 'Section not found');
            }
            throw new AppError(500, 'Failed to delete section');
        }
    }

    async getSectionsByClass(classId) {
        try {
            const sections = await prisma.section.findMany({
                where: { classId: parseInt(classId) },
                include: {
                    students: true
                }
            });
            return sections;
        } catch (error) {
            throw new AppError(500, 'Failed to fetch sections');
        }
    }
}

export const sectionService = new SectionService(); 