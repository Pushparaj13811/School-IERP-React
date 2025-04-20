import { prisma } from '../databases/prismaClient.js';
import { ApiError } from '../utils/apiError.js';

/**
 * Service class for handling holiday-related operations
 */
class HolidayService {
    /**
     * Get all holidays with optional filtering
     */
    async getAllHolidays(filters = {}) {
        const { year, month, holidayTypeId, isRecurring, page = 1, limit = 20 } = filters;
        
        // Build filter conditions
        const where = {};
        
        if (year) {
            const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
            const endDate = new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`);
            
            where.fromDate = {
                gte: startDate,
                lt: endDate
            };
        }
        
        if (month && year) {
            const startDate = new Date(`${year}-${month.padStart(2, '0')}-01T00:00:00.000Z`);
            let endDate;
            
            if (parseInt(month) === 12) {
                endDate = new Date(`${parseInt(year) + 1}-01-01T00:00:00.000Z`);
            } else {
                endDate = new Date(`${year}-${(parseInt(month) + 1).toString().padStart(2, '0')}-01T00:00:00.000Z`);
            }
            
            where.fromDate = {
                gte: startDate,
                lt: endDate
            };
        }
        
        if (holidayTypeId) {
            where.holidayTypeId = parseInt(holidayTypeId);
        }
        
        if (isRecurring !== undefined) {
            where.isRecurring = isRecurring === 'true';
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        // Get total count for pagination
        const totalCount = await prisma.holiday.count({ where });
        
        // Get holidays
        const holidays = await prisma.holiday.findMany({
            where,
            include: {
                holidayType: true
            },
            orderBy: {
                fromDate: 'asc'
            },
            skip,
            take: parseInt(limit)
        });
        
        // Pagination metadata
        const totalPages = Math.ceil(totalCount / parseInt(limit));
        const hasNextPage = parseInt(page) < totalPages;
        const hasPrevPage = parseInt(page) > 1;
        
        return {
            holidays,
            pagination: {
                totalCount,
                totalPages,
                currentPage: parseInt(page),
                hasNextPage,
                hasPrevPage
            }
        };
    }
    
    /**
     * Get a holiday by ID
     */
    async getHolidayById(id) {
        const holiday = await prisma.holiday.findUnique({
            where: { id: parseInt(id) },
            include: {
                holidayType: true
            }
        });
        
        if (!holiday) {
            throw new ApiError(404, "Holiday not found");
        }
        
        return holiday;
    }
    
    /**
     * Create a new holiday
     */
    async createHoliday(holidayData) {
        const {
            name,
            description,
            fromDate,
            toDate,
            holidayTypeId,
            isRecurring,
            recurrencePattern
        } = holidayData;
        
        // Validate required fields
        if (!name) {
            throw new ApiError(400, "Holiday name is required");
        }
        if (!fromDate) {
            throw new ApiError(400, "From date is required");
        }
        if (!toDate) {
            throw new ApiError(400, "To date is required");
        }
        if (!holidayTypeId) {
            throw new ApiError(400, "Holiday type is required");
        }
        
        // Validate dates
        const fromDateObj = new Date(fromDate);
        const toDateObj = new Date(toDate);
        
        if (isNaN(fromDateObj.getTime())) {
            throw new ApiError(400, "Invalid from date");
        }
        if (isNaN(toDateObj.getTime())) {
            throw new ApiError(400, "Invalid to date");
        }
        if (fromDateObj > toDateObj) {
            throw new ApiError(400, "From date cannot be greater than to date");
        }
        
        // Check if holiday type exists
        const holidayType = await prisma.holidayType.findUnique({
            where: { id: parseInt(holidayTypeId) }
        });
        
        if (!holidayType) {
            throw new ApiError(404, "Holiday type not found");
        }
        
        try {
            // Create holiday
            const newHoliday = await prisma.holiday.create({
                data: {
                    name,
                    description,
                    fromDate: fromDateObj,
                    toDate: toDateObj,
                    holidayTypeId: parseInt(holidayTypeId),
                    isRecurring: isRecurring === true,
                    recurrencePattern
                }
            });
            
            return newHoliday;
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ApiError(400, "A holiday with the same dates and name already exists");
            }
            throw error;
        }
    }
    
    /**
     * Update an existing holiday
     */
    async updateHoliday(id, updateData) {
        // Find the holiday
        const existingHoliday = await prisma.holiday.findUnique({
            where: { id: parseInt(id) }
        });
        
        if (!existingHoliday) {
            throw new ApiError(404, "Holiday not found");
        }
        
        const {
            name,
            description,
            fromDate,
            toDate,
            holidayTypeId,
            isRecurring,
            recurrencePattern
        } = updateData;
        
        // Validate dates if provided
        let fromDateObj;
        let toDateObj;
        
        if (fromDate) {
            fromDateObj = new Date(fromDate);
            if (isNaN(fromDateObj.getTime())) {
                throw new ApiError(400, "Invalid from date");
            }
        }
        
        if (toDate) {
            toDateObj = new Date(toDate);
            if (isNaN(toDateObj.getTime())) {
                throw new ApiError(400, "Invalid to date");
            }
        }
        
        if (fromDateObj && toDateObj && fromDateObj > toDateObj) {
            throw new ApiError(400, "From date cannot be greater than to date");
        }
        
        // Check if holiday type exists if provided
        if (holidayTypeId) {
            const holidayType = await prisma.holidayType.findUnique({
                where: { id: parseInt(holidayTypeId) }
            });
            
            if (!holidayType) {
                throw new ApiError(404, "Holiday type not found");
            }
        }
        
        // Update holiday
        const holidayUpdateData = {};
        if (name !== undefined) holidayUpdateData.name = name;
        if (description !== undefined) holidayUpdateData.description = description;
        if (fromDate !== undefined) holidayUpdateData.fromDate = fromDateObj;
        if (toDate !== undefined) holidayUpdateData.toDate = toDateObj;
        if (holidayTypeId !== undefined) holidayUpdateData.holidayTypeId = parseInt(holidayTypeId);
        if (isRecurring !== undefined) holidayUpdateData.isRecurring = isRecurring === true;
        if (recurrencePattern !== undefined) holidayUpdateData.recurrencePattern = recurrencePattern;
        
        try {
            const updatedHoliday = await prisma.holiday.update({
                where: { id: parseInt(id) },
                data: holidayUpdateData
            });
            
            return updatedHoliday;
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ApiError(400, "A holiday with the same dates and name already exists");
            }
            throw error;
        }
    }
    
    /**
     * Delete a holiday
     */
    async deleteHoliday(id) {
        // Find the holiday
        const existingHoliday = await prisma.holiday.findUnique({
            where: { id: parseInt(id) }
        });
        
        if (!existingHoliday) {
            throw new ApiError(404, "Holiday not found");
        }
        
        // Delete the holiday
        await prisma.holiday.delete({
            where: { id: parseInt(id) }
        });
        
        return true;
    }
    
    /**
     * Get all holiday types
     */
    async getHolidayTypes() {
        const holidayTypes = await prisma.holidayType.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        
        return { holidayTypes };
    }
    
    /**
     * Create a new holiday type
     */
    async createHolidayType(typeData) {
        const { name, description } = typeData;
        
        if (!name) {
            throw new ApiError(400, "Holiday type name is required");
        }
        
        try {
            const holidayType = await prisma.holidayType.create({
                data: {
                    name,
                    description
                }
            });
            
            return holidayType;
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ApiError(400, "A holiday type with this name already exists");
            }
            throw error;
        }
    }

    /**
     * Delete a holiday type
     */
    async deleteHolidayType(id) {

        if(!id){
            throw new ApiError(400, "Holiday type id is required");
        }

        try {
            await prisma.holidayType.delete({
                where: { id: parseInt(id) }
            });

            return true;
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ApiError(400, "Holiday type is still associated with holidays");
            }   
            throw error;
        }
    }
    
    /**
     * Get upcoming holidays
     * @param {number} days - Number of days to look ahead
     * @returns {Promise<Array>} - List of upcoming holidays
     */
    async getUpcomingHolidays(days = 30) {
        const today = new Date();
        const endDate = new Date();
        endDate.setDate(today.getDate() + days);
        
        try {
            const holidays = await prisma.holiday.findMany({
                where: {
                    OR: [
                        {
                            // Non-recurring holidays within the date range
                            isRecurring: false,
                            fromDate: {
                                gte: today,
                                lte: endDate
                            }
                        },
                        {
                            // Recurring holidays (we'll check the dates manually)
                            isRecurring: true
                        }
                    ]
                },
                include: {
                    holidayType: true
                },
                orderBy: {
                    fromDate: 'asc'
                }
            });
            
            // Process recurring holidays to check if they occur in the next 'days' days
            const processedHolidays = holidays.map(holiday => {
                // Format for the response
                const formattedHoliday = {
                    id: holiday.id,
                    title: holiday.name,
                    description: holiday.description,
                    date: holiday.fromDate,
                    toDate: holiday.toDate,
                    holidayType: holiday.holidayType,
                    isRecurring: holiday.isRecurring,
                    recurrencePattern: holiday.recurrencePattern
                };
                
                return formattedHoliday;
            });
            
            // For a more complex implementation, actual recurrence patterns would be processed here
            // For example, "3rd Saturday" or "Every Sunday" would require calculating actual dates
            
            // Filter to only include holidays in the date range
            const upcomingHolidays = processedHolidays.filter(holiday => {
                const holidayFromDate = new Date(holiday.date);
                return holidayFromDate >= today && holidayFromDate <= endDate;
            });
            
            return upcomingHolidays;
        } catch (error) {
            console.error('Error fetching upcoming holidays:', error);
            throw new ApiError(500, 'Failed to fetch upcoming holidays');
        }
    }
}

export default new HolidayService(); 