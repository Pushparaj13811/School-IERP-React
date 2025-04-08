import { prisma } from '../databases/prismaClient.js';
import { AppError } from '../middlewares/errorHandler.js';

export class ClassService {
    async createClass(data) {
        try {
            const newClass = await prisma.class.create({
                data: {
                    name: data.name
                }
            });
            return newClass;
        } catch (error) {
            throw new AppError(500, 'Failed to create class');
        }
    }

    async getAllClasses() {
        try {
            const classes = await prisma.class.findMany({
                include: {
                    sections: true,
                    students: true
                }
            });
            return classes;
        } catch (error) {
            throw new AppError(500, 'Failed to fetch classes');
        }
    }

    async getClassById(id) {
        try {
            const classData = await prisma.class.findUnique({
                where: { id: parseInt(id) },
                include: {
                    sections: true,
                    students: true
                }
            });

            if (!classData) {
                throw new AppError(404, 'Class not found');
            }

            return classData;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError(500, 'Failed to fetch class');
        }
    }

    async updateClass(id, data) {
        try {
            const updatedClass = await prisma.class.update({
                where: { id: parseInt(id) },
                data: {
                    name: data.name
                }
            });
            return updatedClass;
        } catch (error) {
            if (error.code === 'P2025') {
                throw new AppError(404, 'Class not found');
            }
            throw new AppError(500, 'Failed to update class');
        }
    }

    async deleteClass(id) {
        try {
            await prisma.class.delete({
                where: { id: parseInt(id) }
            });
            return { message: 'Class deleted successfully' };
        } catch (error) {
            if (error.code === 'P2025') {
                throw new AppError(404, 'Class not found');
            }
            throw new AppError(500, 'Failed to delete class');
        }
    }
}

export const classService = new ClassService(); 