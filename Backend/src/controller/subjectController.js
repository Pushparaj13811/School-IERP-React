import { subjectService } from '../services/subjectService.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

// Create a new subject
export const createSubject = async (req, res, next) => {
  try {
    const newSubject = await subjectService.createSubject(req.body);
    return res
      .status(201)
      .json(new ApiResponse(201, { status: 'success', data: { subject: newSubject } }));
  } catch (error) {
    next(error);
  }
};

// Get all subjects
export const getAllSubjects = async (req, res, next) => {
  try {
    const subjects = await subjectService.getAllSubjects();
    return res.status(200).json(
      new ApiResponse(
        200,
        { subjects },
        'Subjects fetched successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

// Get a single subject by ID
export const getSubjectById = async (req, res, next) => {
  try {
    const subject = await subjectService.getSubjectById(req.params.id);
    return res
      .status(200)
      .json(new ApiResponse(200, { status: 'success', data: { subject } }));
  } catch (error) {
    next(error);
  }
};

// Update a subject
export const updateSubject = async (req, res, next) => {
  try {
    const updatedSubject = await subjectService.updateSubject(req.params.id, req.body);
    return res
      .status(200)
      .json(new ApiResponse(200, { status: 'success', data: { subject: updatedSubject } }));
  } catch (error) {
    next(error);
  }
};

// Delete a subject
export const deleteSubject = async (req, res, next) => {
  try {
    const result = await subjectService.deleteSubject(req.params.id);
    return res
      .status(200)
      .json(new ApiResponse(200, { status: 'success', data: result }));
  } catch (error) {
    next(error);
  }
};

// Get subjects by class ID
export const getSubjectsByClassId = async (req, res, next) => {
  try {
    const { classId } = req.params;

    if (!classId || isNaN(parseInt(classId))) {
      return next(new ApiError(400, "Invalid class ID provided"));
    }

    const subjects = await subjectService.getSubjectsByClassId(classId);

    return res.status(200).json(
      new ApiResponse(
        200,
        { subjects },
        'Subjects fetched successfully'
      )
    );
  } catch (error) {
    console.error("Error fetching subjects by class ID:", error);
    next(error);
  }
};

// Assign subject to classes
export const assignSubjectToClasses = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const { classes } = req.body;

    if (!subjectId || isNaN(parseInt(subjectId))) {
      return next(new ApiError(400, "Invalid subject ID provided"));
    }

    if (!classes || !Array.isArray(classes) || classes.length === 0) {
      return next(new ApiError(400, "Classes array is required"));
    }

    const result = await subjectService.assignSubjectToClasses(subjectId, classes);

    return res.status(200).json(
      new ApiResponse(
        200,
        { result },
        'Subject assigned to classes successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};