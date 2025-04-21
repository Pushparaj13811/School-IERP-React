import timetableService from '../services/timetableService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

class TimetableController {
  /**
   * Create a new timetable
   */
  createTimetable = asyncHandler(async (req, res) => {
    const timetable = await timetableService.createTimetable(req.body);
    return res.status(201).json(new ApiResponse(201, timetable, 'Timetable created successfully'));
  });

  /**
   * Get timetable by ID
   */
  getTimetableById = asyncHandler(async (req, res) => {
    const timetable = await timetableService.getTimetableById(req.params.id);
    return res.status(200).json(new ApiResponse(200, timetable, 'Timetable retrieved successfully'));
  });

  /**
   * Get timetable by class, section, academic year and term
   */
  getTimetable = asyncHandler(async (req, res) => {
    const { classId, sectionId, academicYear, term } = req.query;

    if (!classId || !sectionId || !academicYear || !term) {
      return res.status(400).json(new ApiResponse(400, null, 'Missing required parameters: classId, sectionId, academicYear, term'));
    }

    try {
      console.log(`Controller received request for timetable: classId=${classId}, sectionId=${sectionId}, academicYear=${academicYear}, term=${term}`);
      const timetable = await timetableService.getTimetable(classId, sectionId, academicYear, term);
      
      if (!timetable) {
        return res.status(404).json(new ApiResponse(404, null, 'Timetable not found'));
      }
      
      return res.status(200).json(new ApiResponse(200, timetable, 'Timetable retrieved successfully'));
    } catch (error) {
      console.error('Error in getTimetable controller:', error);
      return res.status(500).json(new ApiResponse(500, null, 'Server error while retrieving timetable'));
    }
  });

  /**
   * Get student's timetable
   */
  getStudentTimetable = asyncHandler(async (req, res) => {
    try {
      // Either get from params or from authenticated user
      const studentId = req.params.studentId || (req.user && req.user.studentId);
      
      console.log('Student timetable request:', { 
        params: req.params.studentId,
        userStudentId: req.user?.studentId,
        user: req.user
      });
      
      if (!studentId) {
        // If there's no studentId but there's a user object with student role, try to fetch student info
        if (req.user && req.user.role === 'STUDENT') {
          // Get student ID from the user record
          try {
            const { PrismaClient } = await import('@prisma/client');
            const prisma = new PrismaClient();
            
            const student = await prisma.student.findFirst({
              where: { 
                userId: req.user.id 
              }
            });
            
            if (student) {
              console.log(`Found student with ID ${student.id} for user ${req.user.id}`);
              const timetable = await timetableService.getStudentTimetable(student.id);
              return res.status(200).json(new ApiResponse(200, timetable, 'Student timetable retrieved successfully'));
            }
          } catch (lookupError) {
            console.error('Error looking up student record:', lookupError);
          }
        }
        
        return res.status(400).json(new ApiResponse(400, null, 'Student ID is required'));
      }

      console.log(`Fetching timetable for student ID: ${studentId}`);
      const timetable = await timetableService.getStudentTimetable(studentId);
      return res.status(200).json(new ApiResponse(200, timetable, 'Student timetable retrieved successfully'));
    } catch (error) {
      console.error('Error in getStudentTimetable:', error);
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json(
        new ApiResponse(statusCode, null, error.message || 'Error retrieving student timetable')
      );
    }
  });

  /**
   * Get teacher's timetable
   */
  getTeacherTimetable = asyncHandler(async (req, res) => {
    // Either get from params or from authenticated user
    let teacherId = req.params.teacherId || req.user.teacherId;
    console.log('Teacher ID:', teacherId);
    console.log('User:', req.user);

    if (!teacherId) {
      if (req.user && req.user.role === 'TEACHER') {
        try {
          const { PrismaClient } = await import('@prisma/client');
          const prisma = new PrismaClient();

          const teacher = await prisma.teacher.findFirst({
            where: {
              userId: req.user.id
            }
          });

          if (teacher) {
            teacherId = teacher.id;
            console.log('Teacher ID found:', teacherId);
          }
        } catch (error) {
          console.error('Error looking up teacher record:', error);
        }
      } else {
        return res.status(400).json(new ApiResponse(400, null, 'Teacher ID is required'));
      }
    }

    const timetable = await timetableService.getTeacherTimetable(teacherId);
    return res.status(200).json(new ApiResponse(200, timetable, 'Teacher timetable retrieved successfully'));
  });

  /**
   * Add period to timetable
   */
  addPeriod = asyncHandler(async (req, res) => {
    const period = await timetableService.addPeriod(req.body);
    return res.status(201).json(new ApiResponse(201, period, 'Period added to timetable successfully'));
  });

  /**
   * Delete period from timetable
   */
  deletePeriod = asyncHandler(async (req, res) => {
    const result = await timetableService.deletePeriod(req.params.id);
    return res.status(200).json(new ApiResponse(200, result, 'Period deleted successfully'));
  });

  /**
   * Create a new time slot
   */
  createTimeSlot = asyncHandler(async (req, res) => {
    console.log('Controller received request to create time slot:', req.body);
    const timeSlot = await timetableService.createTimeSlot(req.body);
    console.log('Time slot created:', timeSlot);
    return res.status(201).json(new ApiResponse(201, timeSlot, 'Time slot created successfully'));
  });

  /**
   * Get all time slots
   */
  getAllTimeSlots = asyncHandler(async (req, res) => {
    const timeSlots = await timetableService.getAllTimeSlots();
    return res.status(200).json(new ApiResponse(200, timeSlots, 'Time slots retrieved successfully'));
  });

  /**
   * Delete a time slot
   */
  deleteTimeSlot = asyncHandler(async (req, res) => {
    const result = await timetableService.deleteTimeSlot(req.params.id);
    return res.status(200).json(new ApiResponse(200, result, 'Time slot deleted successfully'));
  });
}

export default new TimetableController(); 