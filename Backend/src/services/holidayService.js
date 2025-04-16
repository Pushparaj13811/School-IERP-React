import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler.js';

const prisma = new PrismaClient();

export class HolidayService {
    async addHoliday(data) {
        try {
            const { name, description, fromDate, toDate, holidayTypeId, isRecurring, recurrencePattern } = data;

            // Validate date range
            const from = new Date(fromDate);
            const to = new Date(toDate);

            if (from > to) {
                throw new AppError(400, 'From date cannot be after to date');
            }

            // Check for overlapping holidays
            const overlappingHoliday = await prisma.holiday.findFirst({
                where: {
                    OR: [
                        {
                            fromDate: {
                                lte: to
                            },
                            toDate: {
                                gte: from
                            }
                        }
                    ]
                }
            });

            if (overlappingHoliday) {
                throw new AppError(400, 'Holiday dates overlap with existing holiday');
            }

            // Create holiday
            const holiday = await prisma.holiday.create({
                data: {
                    name,
                    description,
                    fromDate: from,
                    toDate: to,
                    holidayTypeId,
                    isRecurring,
                    recurrencePattern
                },
                include: {
                    holidayType: true
                }
            });

            return holiday;
        } catch (error) {
            throw error;
        }
    }

    async getHolidays(startDate, endDate, holidayTypeId) {
        try {
            const where = {};

            if (startDate && endDate) {
                where.OR = [
                    {
                        fromDate: {
                            lte: new Date(endDate)
                        },
                        toDate: {
                            gte: new Date(startDate)
                        }
                    }
                ];
            }

            if (holidayTypeId) {
                where.holidayTypeId = parseInt(holidayTypeId);
            }

            const holidays = await prisma.holiday.findMany({
                where,
                include: {
                    holidayType: true
                },
                orderBy: {
                    fromDate: 'asc'
                }
            });

            return holidays;
        } catch (error) {
            throw error;
        }
    }

    async updateHoliday(id, updateData) {
        try {
            // Check if holiday exists
            const existingHoliday = await prisma.holiday.findUnique({
                where: { id: parseInt(id) }
            });

            if (!existingHoliday) {
                throw new AppError(404, 'Holiday not found');
            }

            // Validate date range if dates are being updated
            if (updateData.fromDate || updateData.toDate) {
                const from = new Date(updateData.fromDate || existingHoliday.fromDate);
                const to = new Date(updateData.toDate || existingHoliday.toDate);

                if (from > to) {
                    throw new AppError(400, 'From date cannot be after to date');
                }

                // Check for overlapping holidays
                const overlappingHoliday = await prisma.holiday.findFirst({
                    where: {
                        id: {
                            not: parseInt(id)
                        },
                        OR: [
                            {
                                fromDate: {
                                    lte: to
                                },
                                toDate: {
                                    gte: from
                                }
                            }
                        ]
                    }
                });

                if (overlappingHoliday) {
                    throw new AppError(400, 'Holiday dates overlap with existing holiday');
                }
            }

            // Update holiday
            const holiday = await prisma.holiday.update({
                where: { id: parseInt(id) },
                data: updateData,
                include: {
                    holidayType: true
                }
            });

            return holiday;
        } catch (error) {
            throw error;
        }
    }

    async deleteHoliday(id) {
        try {
            // Check if holiday exists
            const existingHoliday = await prisma.holiday.findUnique({
                where: { id: parseInt(id) }
            });

            if (!existingHoliday) {
                throw new AppError(404, 'Holiday not found');
            }

            // Delete holiday
            await prisma.holiday.delete({
                where: { id: parseInt(id) }
            });
        } catch (error) {
            throw error;
        }
    }
} 