import timetableService from '../services/timetableService.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';  

class TimetableController {
  /**
   * Create a new timetable
   */
  createTimetable = asyncHandler(async (req, res) => {
    const timetable = await timetableService.createTimetable(req.body);
    new ApiResponse(res, 201, 'Timetable created successfully', timetable);
  });

  /**
   * Get timetable by ID
   */
    getTimetableById = asyncHandler(async (req, res) => {
    const timetable = await timetableService.getTimetableById(req.params.id);
    new ApiResponse(res, 200, 'Timetable retrieved successfully', timetable);
  });

  /**
   * Get timetable by class, section, academic year and term
   */
  getTimetable = asyncHandler(async (req, res) => {
    const { classId, sectionId, academicYear, term } = req.query;
    
    if (!classId || !sectionId || !academicYear || !term) {
      return new ApiResponse(res, 400, 'Missing required parameters: classId, sectionId, academicYear, term');
    }
    
    const timetable = await timetableService.getTimetable(classId, sectionId, academicYear, term);
    new ApiResponse(res, 200, 'Timetable retrieved successfully', timetable);
  });

  /**
   * Get student's timetable
   */
  getStudentTimetable = asyncHandler(async (req, res) => {
    // Either get from params or from authenticated user
    const studentId = req.params.studentId || req.user.studentId;
    
    if (!studentId) {
      return new ApiResponse(res, 400, 'Student ID is required');
    }
    
    const timetable = await timetableService.getStudentTimetable(studentId);
    new ApiResponse(res, 200, 'Student timetable retrieved successfully', timetable);
  });

  /**
   * Get teacher's timetable
   */
  getTeacherTimetable = asyncHandler(async (req, res) => {
    // Either get from params or from authenticated user
    const teacherId = req.params.teacherId || req.user.teacherId;
    
    if (!teacherId) {
      return new ApiResponse(res, 400, 'Teacher ID is required');
    }
    
    const timetable = await timetableService.getTeacherTimetable(teacherId);
    new ApiResponse(res, 200, 'Teacher timetable retrieved successfully', timetable);
  });

  /**
   * Add period to timetable
   */
  addPeriod = asyncHandler(async (req, res) => {
    const period = await timetableService.addPeriod(req.body);
    new ApiResponse(res, 201, 'Period added to timetable successfully', period);
  });

  /**
   * Delete period from timetable
   */
  deletePeriod = asyncHandler(async (req, res) => {
    const result = await timetableService.deletePeriod(req.params.id);
    new ApiResponse(res, 200, 'Period deleted successfully', result);
  });

  /**
   * Create a new time slot
   */
  createTimeSlot = asyncHandler(async (req, res) => {
    const timeSlot = await timetableService.createTimeSlot(req.body);
    new ApiResponse(res, 201, 'Time slot created successfully', timeSlot);
  });

  /**
   * Get all time slots
   */
  getAllTimeSlots = asyncHandler(async (req, res) => {
    const timeSlots = await timetableService.getAllTimeSlots();
    new ApiResponse(res, 200, 'Time slots retrieved successfully', timeSlots);
  });
}

export default new TimetableController(); 