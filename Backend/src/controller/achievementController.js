import { AchievementService } from '../services/achievementService.js';
import { AppError } from '../middlewares/errorHandler.js';

const achievementService = new AchievementService();

export const addAchievement = async (req, res, next) => {
    try {
        const { activityType, title, organization, numberOfDays, fromDate, toDate, description, testimonial, achievementTypeId, certificateUrl, studentId, teacherId } = req.body;
        
        if (!activityType || !title || !organization || !fromDate || !toDate || !description || !achievementTypeId) {
            return next(new AppError(400, 'Please provide all required fields'));
        }

        if (!studentId && !teacherId) {
            return next(new AppError(400, 'Please provide either studentId or teacherId'));
        }

        const achievement = await achievementService.addAchievement({
            activityType,
            title,
            organization,
            numberOfDays,
            fromDate,
            toDate,
            description,
            testimonial,
            achievementTypeId,
            certificateUrl,
            studentId,
            teacherId
        });
        
        res.status(201).json({
            status: 'success',
            data: { achievement }
        });
    } catch (error) {
        next(error);
    }
};

export const getAchievements = async (req, res, next) => {
    try {
        const { studentId, teacherId, achievementTypeId, startDate, endDate } = req.query;
        
        const achievements = await achievementService.getAchievements({
            studentId,
            teacherId,
            achievementTypeId,
            startDate,
            endDate
        });
        
        res.status(200).json({
            status: 'success',
            data: { achievements }
        });
    } catch (error) {
        next(error);
    }
};

export const updateAchievement = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const achievement = await achievementService.updateAchievement(id, updateData);
        
        res.status(200).json({
            status: 'success',
            data: { achievement }
        });
    } catch (error) {
        next(error);
    }
};

export const deleteAchievement = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        await achievementService.deleteAchievement(id);
        
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (error) {
        next(error);
    }
}; 