import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import holidayService from '../services/holidayService.js';

/**
 * @desc    Get all holidays
 * @route   GET /api/v1/holidays
 * @access  Admin, Teacher, Student, Parent
 */
const getAllHolidays = asyncHandler(async (req, res) => {
  try {
    const { year, month, holidayTypeId, isRecurring, page, limit } = req.query;
    
    const result = await holidayService.getAllHolidays({
      year, month, holidayTypeId, isRecurring, page, limit
    });
    
    return res.status(200).json(
      new ApiResponse(200, result, "Holidays fetched successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Error fetching holidays", error);
  }
});

/**
 * @desc    Get holiday by ID
 * @route   GET /api/v1/holidays/:id
 * @access  Admin, Teacher, Student, Parent
 */
const getHolidayById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    const holiday = await holidayService.getHolidayById(id);
    
    return res.status(200).json(
      new ApiResponse(200, holiday, "Holiday fetched successfully")
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Error fetching holiday", error);
  }
});

/**
 * @desc    Get upcoming holidays for the next 30 days
 * @route   GET /api/v1/holidays/upcoming
 * @access  Admin, Teacher, Student, Parent
 */
const getUpcomingHolidays = asyncHandler(async (req, res) => {
  try {
    // Get upcoming holidays for the next 30 days
    const upcomingHolidays = await holidayService.getUpcomingHolidays();
    
    // Return the response
    return res.status(200).json(
      new ApiResponse(200, { holidays: upcomingHolidays }, 'Upcoming holidays fetched successfully')
    );
  } catch (error) {
    console.error('Error in getUpcomingHolidays:', error);
    throw new ApiError(500, 'Something went wrong while fetching upcoming holidays');
  }
});

/**
 * @desc    Create a new holiday
 * @route   POST /api/v1/holidays
 * @access  Admin
 */
const createHoliday = asyncHandler(async (req, res) => {
  try {
    const holidayData = req.body;
    
    const newHoliday = await holidayService.createHoliday(holidayData);
    
    return res.status(201).json(
      new ApiResponse(201, newHoliday, "Holiday created successfully")
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Error creating holiday", error);
  }
});

/**
 * @desc    Update a holiday
 * @route   PUT /api/v1/holidays/:id
 * @access  Admin
 */
const updateHoliday = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedHoliday = await holidayService.updateHoliday(id, updateData);
    
    return res.status(200).json(
      new ApiResponse(200, updatedHoliday, "Holiday updated successfully")
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Error updating holiday", error);
  }
});

/**
 * @desc    Delete a holiday
 * @route   DELETE /api/v1/holidays/:id
 * @access  Admin
 */
const deleteHoliday = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    
    await holidayService.deleteHoliday(id);
    
    return res.status(200).json(
      new ApiResponse(200, null, "Holiday deleted successfully")
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Error deleting holiday", error);
  }
});

/**
 * @desc    Get holiday types
 * @route   GET /api/v1/holidays/types
 * @access  Admin, Teacher, Student, Parent
 */
const getHolidayTypes = asyncHandler(async (req, res) => {
  try {
    const result = await holidayService.getHolidayTypes();
    
    return res.status(200).json(
      new ApiResponse(200, result, "Holiday types fetched successfully")
    );
  } catch (error) {
    throw new ApiError(500, "Error fetching holiday types", error);
  }
});

/**
 * @desc    Create a holiday type
 * @route   POST /api/v1/holidays/types
 * @access  Admin
 */
const createHolidayType = asyncHandler(async (req, res) => {
  try {
    const typeData = req.body;
    
    const holidayType = await holidayService.createHolidayType(typeData);
    
    return res.status(201).json(
      new ApiResponse(201, holidayType, "Holiday type created successfully")
    );
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Error creating holiday type", error);
  }
});

export {
  getAllHolidays,
  getHolidayById,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  getHolidayTypes,
  createHolidayType,
  getUpcomingHolidays
}; 