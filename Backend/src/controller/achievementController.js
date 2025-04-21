import { AchievementService } from '../services/achievementService.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

const achievementService = new AchievementService();

export const addAchievement = async (req, res, next) => {
    try {
        const { activityType, title, organization, numberOfDays, fromDate, toDate, description, testimonial, achievementTypeId, certificateUrl, studentId, teacherId } = req.body;
        
        if (!activityType || !title || !organization || !fromDate || !toDate || !description || !achievementTypeId) {
            return next(new ApiError(400, 'Please provide all required fields'));
        }

        if (!studentId && !teacherId) {
            return next(new ApiError(400, 'Please provide either studentId or teacherId'));
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
        
        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    achievement,
                    'Achievement created successfully'
                )
            );
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
        
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    achievements,
                    'Achievements fetched successfully'
                )
            );
    } catch (error) {
        next(error);
    }
};

export const updateAchievement = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const achievement = await achievementService.updateAchievement(id, updateData);
        
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    achievement,
                    'Achievement updated successfully'
                )
            );
    } catch (error) {
        next(error);
    }
};

export const deleteAchievement = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        await achievementService.deleteAchievement(id);
        
        return res
            .status(204)
            .json(
                new ApiResponse(
                    204,
                    null,
                    'Achievement deleted successfully'
                )
            );
    } catch (error) {
        next(error);
    }
}; 