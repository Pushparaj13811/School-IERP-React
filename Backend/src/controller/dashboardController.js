import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as dashboardService from '../services/dashboardService.js';

/**
 * Get Admin Dashboard data
 * @route GET /api/v1/dashboard/admin
 * @access Private (Admin only)
 */
const getAdminDashboard = asyncHandler(async (req, res) => {
  try {
    const dashboardData = await dashboardService.getAdminDashboardData();
    
    return res.status(200).json(
      new ApiResponse(200, dashboardData, "Admin dashboard data fetched successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Error fetching admin dashboard data", error);
  }
});

/**
 * Get Teacher Dashboard data
 * @route GET /api/v1/dashboard/teacher
 * @access Private (Teacher only)
 */
const getTeacherDashboard = asyncHandler(async (req, res) => {
  try {
    const teacherId = req.user.teacher?.id;

    if (!teacherId) {
      throw new ApiError(400, "Teacher ID not found");
    }

    const dashboardData = await dashboardService.getTeacherDashboardData(teacherId);
    
    return res.status(200).json(
      new ApiResponse(200, dashboardData, "Teacher dashboard data fetched successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Error fetching teacher dashboard data", error);
  }
});

/**
 * Get Student Dashboard data
 * @route GET /api/v1/dashboard/student
 * @access Private (Student only)
 */
const getStudentDashboard = asyncHandler(async (req, res) => {
  try {
    const studentId = req.user.student?.id;

    if (!studentId) {
      throw new ApiError(400, "Student ID not found");
    }

    const dashboardData = await dashboardService.getStudentDashboardData(studentId);
    
    return res.status(200).json(
      new ApiResponse(200, dashboardData, "Student dashboard data fetched successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Error fetching student dashboard data", error);
  }
});

/**
 * Get Parent Dashboard data
 * @route GET /api/v1/dashboard/parent
 * @access Private (Parent only)
 */
const getParentDashboard = asyncHandler(async (req, res) => {
  try {
    const parentId = req.user.parent?.id;

    if (!parentId) {
      throw new ApiError(400, "Parent ID not found");
    }

    const dashboardData = await dashboardService.getParentDashboardData(parentId);
    
    return res.status(200).json(
      new ApiResponse(200, dashboardData, "Parent dashboard data fetched successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Error fetching parent dashboard data", error);
  }
});

export {
  getAdminDashboard,
  getTeacherDashboard,
  getStudentDashboard,
  getParentDashboard
}; 