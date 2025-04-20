import { prisma } from '../databases/prismaClient.js';
import { AppError } from '../middlewares/errorHandler.js';

export class SubjectService {
    async createSubject(data) {
        try {
            const existingSubject = await prisma.subject.findUnique({
                where: { code: data.code }
            });

            if (existingSubject) {
                throw new AppError(400, `Subject with code '${data.code}' already exists`);
            }

            const newSubject = await prisma.subject.create({
                data: {
                    name: data.name,
                    code: data.code,
                    description: data.description || null
                }
            });

            // If classes are provided, associate the subject with them
            if (data.classes && Array.isArray(data.classes) && data.classes.length > 0) {
                await this.assignSubjectToClasses(newSubject.id, data.classes);
            }

            return newSubject;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(500, 'Failed to create subject');
        }
    }

    async getAllSubjects() {
        try {
            const subjects = await prisma.subject.findMany({
                orderBy: {
                    name: 'asc'
                }
            });
            return subjects;
        } catch (error) {
            throw new AppError(500, 'Failed to fetch subjects');
        }
    }

    async getSubjectById(id) {
        try {
            const subject = await prisma.subject.findUnique({
                where: { id: parseInt(id) },
                include: {
                    classes: {
                        include: {
                            class: true
                        }
                    }
                }
            });

            if (!subject) {
                throw new AppError(404, 'Subject not found');
            }

            return subject;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(500, 'Failed to fetch subject');
        }
    }

    async updateSubject(id, data) {
        try {
            // Check if code is being updated and if it already exists
            if (data.code) {
                const existingSubject = await prisma.subject.findFirst({
                    where: {
                        code: data.code,
                        id: { not: parseInt(id) }
                    }
                });

                if (existingSubject) {
                    throw new AppError(400, `Subject with code '${data.code}' already exists`);
                }
            }

            const updatedSubject = await prisma.subject.update({
                where: { id: parseInt(id) },
                data: {
                    name: data.name,
                    code: data.code,
                    description: data.description
                }
            });

            // Update class associations if provided
            if (data.classes && Array.isArray(data.classes)) {
                await this.updateSubjectClasses(parseInt(id), data.classes);
            }

            return updatedSubject;
        } catch (error) {
            if (error.code === 'P2025') {
                throw new AppError(404, 'Subject not found');
            }
            if (error instanceof AppError) throw error;
            throw new AppError(500, 'Failed to update subject');
        }
    }

    async deleteSubject(id) {
        try {
            // First, remove all class associations
            await prisma.classSubject.deleteMany({
                where: { subjectId: parseInt(id) }
            });

            // Then delete the subject
            await prisma.subject.delete({
                where: { id: parseInt(id) }
            });
            
            return { message: 'Subject deleted successfully' };
        } catch (error) {
            if (error.code === 'P2025') {
                throw new AppError(404, 'Subject not found');
            }
            throw new AppError(500, 'Failed to delete subject');
        }
    }

    async getSubjectsByClassId(classId) {
        try {
            const subjects = await prisma.classSubject.findMany({
                where: {
                    classId: parseInt(classId)
                },
                include: {
                    subject: true
                }
            });

            return subjects.map(item => item.subject);
        } catch (error) {
            throw new AppError(500, 'Failed to fetch subjects by class ID');
        }
    }

    async assignSubjectToClasses(subjectId, classIds) {
        try {
            const data = classIds.map(classId => ({
                subjectId: parseInt(subjectId),
                classId: parseInt(classId)
            }));

            // Delete existing associations first
            await prisma.classSubject.deleteMany({
                where: { subjectId: parseInt(subjectId) }
            });

            // Create new associations
            await prisma.classSubject.createMany({
                data,
                skipDuplicates: true
            });

            return { message: 'Subject assigned to classes successfully' };
        } catch (error) {
            throw new AppError(500, 'Failed to assign subject to classes');
        }
    }

    async updateSubjectClasses(subjectId, classIds) {
        return this.assignSubjectToClasses(subjectId, classIds);
    }
}

export const subjectService = new SubjectService(); 