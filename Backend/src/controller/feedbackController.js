import * as feedbackService from '../services/feedbackService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Create new feedback
 * POST /feedback
 */
export const createFeedback = asyncHandler(async (req, res) => {
    const feedback = await feedbackService.createFeedback(req.body, req.user);
    return res.status(201).json(
        new ApiResponse(201, { feedback }, 'Feedback submitted successfully')
    );
});

/**
 * Get all feedback (admin only)
 * GET /feedback/all
 */
export const getAllFeedback = asyncHandler(async (req, res) => {
    const result = await feedbackService.getAllFeedback(req.query);
    return res.status(200).json(
        new ApiResponse(200, result, 'Feedback retrieved successfully')
    );
});

/**
 * Get user's own feedback
 * GET /feedback
 */
export const getUserFeedback = asyncHandler(async (req, res) => {
    const feedbacks = await feedbackService.getUserFeedback(req.user);
    return res.status(200).json(
        new ApiResponse(200, { feedbacks }, 'Feedback retrieved successfully')
    );
});

/**
 * Get all feedback types
 * GET /feedback/types
 */
export const getFeedbackTypes = asyncHandler(async (req, res) => {
    const types = await feedbackService.getFeedbackTypes();
    return res.status(200).json(
        new ApiResponse(200, { types }, 'Feedback types retrieved successfully')
    );
});

/**
 * Delete feedback
 * DELETE /feedback/:id
 */
export const deleteFeedback = asyncHandler(async (req, res) => {
    const result = await feedbackService.deleteFeedback(req.params.id, req.user);
    return res.status(200).json(
        new ApiResponse(200, result, 'Feedback deleted successfully')
    );
});
