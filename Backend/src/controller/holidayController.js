import { HolidayService } from '../services/holidayService.js';
import { AppError } from '../middlewares/errorHandler.js';

const holidayService = new HolidayService();

export const addHoliday = async (req, res, next) => {
    try {
        const { name, description, fromDate, toDate, holidayTypeId, isRecurring, recurrencePattern } = req.body;
        
        if (!name || !fromDate || !toDate || !holidayTypeId) {
            return next(new AppError(400, 'Please provide all required fields'));
        }

        const holiday = await holidayService.addHoliday({
            name,
            description,
            fromDate,
            toDate,
            holidayTypeId,
            isRecurring,
            recurrencePattern
        });
        
        res.status(201).json({
            status: 'success',
            data: { holiday }
        });
    } catch (error) {
        next(error);
    }
};

export const getHolidays = async (req, res, next) => {
    try {
        const { startDate, endDate, holidayTypeId } = req.query;
        
        const holidays = await holidayService.getHolidays(startDate, endDate, holidayTypeId);
        
        res.status(200).json({
            status: 'success',
            data: { holidays }
        });
    } catch (error) {
        next(error);
    }
};

export const updateHoliday = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const holiday = await holidayService.updateHoliday(id, updateData);
        
        res.status(200).json({
            status: 'success',
            data: { holiday }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteHoliday = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        await holidayService.deleteHoliday(id);
        
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
}; 