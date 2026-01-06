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

        // Authorization check: Users can only create achievements for themselves
        const { role, student, teacher } = req.user;

        if (role === 'STUDENT') {
            // Students can only create achievements for themselves
            if (!student || !studentId) {
                return next(new ApiError(403, 'Students can only create achievements for themselves'));
            }
            if (parseInt(studentId) !== student.id) {
                return next(new ApiError(403, 'You can only create achievements for yourself'));
            }
            // Ensure no teacherId is set by students
            if (teacherId) {
                return next(new ApiError(403, 'Students cannot create achievements for teachers'));
            }
        } else if (role === 'TEACHER') {
            // Teachers can only create achievements for themselves
            if (!teacher || !teacherId) {
                return next(new ApiError(403, 'Teachers can only create achievements for themselves'));
            }
            if (parseInt(teacherId) !== teacher.id) {
                return next(new ApiError(403, 'You can only create achievements for yourself'));
            }
            // Ensure no studentId is set by teachers
            if (studentId) {
                return next(new ApiError(403, 'Teachers cannot create achievements for students'));
            }
        } else if (role === 'ADMIN') {
            // Admins can create achievements for anyone
        } else {
            return next(new ApiError(403, 'Unauthorized to create achievements'));
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

        // First, get the achievement to check ownership
        const existingAchievement = await achievementService.getAchievementById(id);
        if (!existingAchievement) {
            return next(new ApiError(404, 'Achievement not found'));
        }

        // Authorization check: Users can only update their own achievements
        const { role, student, teacher } = req.user;

        if (role === 'STUDENT') {
            if (!student || existingAchievement.studentId !== student.id) {
                return next(new ApiError(403, 'You can only update your own achievements'));
            }
        } else if (role === 'TEACHER') {
            if (!teacher || existingAchievement.teacherId !== teacher.id) {
                return next(new ApiError(403, 'You can only update your own achievements'));
            }
        } else if (role !== 'ADMIN') {
            return next(new ApiError(403, 'Unauthorized to update achievements'));
        }

        // Prevent changing ownership
        delete updateData.studentId;
        delete updateData.teacherId;

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

        // First, get the achievement to check ownership
        const existingAchievement = await achievementService.getAchievementById(id);
        if (!existingAchievement) {
            return next(new ApiError(404, 'Achievement not found'));
        }

        // Authorization check: Users can only delete their own achievements
        const { role, student, teacher } = req.user;

        if (role === 'STUDENT') {
            if (!student || existingAchievement.studentId !== student.id) {
                return next(new ApiError(403, 'You can only delete your own achievements'));
            }
        } else if (role === 'TEACHER') {
            if (!teacher || existingAchievement.teacherId !== teacher.id) {
                return next(new ApiError(403, 'You can only delete your own achievements'));
            }
        } else if (role !== 'ADMIN') {
            return next(new ApiError(403, 'Unauthorized to delete achievements'));
        }

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