import { classService } from '../services/classService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const createClass = async (req, res, next) => {
    try {
        const newClass = await classService.createClass(req.body);
        return res
            .status(201)
            .json(new ApiResponse(201, { status: 'success', data: { class: newClass } }));
    } catch (error) {
        next(error);
    }
};

export const getAllClasses = async (req, res, next) => {
    try {
        const classes = await classService.getAllClasses();
        return res
            .status(200)
            .json(new ApiResponse(200, { status: 'success', data: { classes } }));
    } catch (error) {
        next(error);
    }
};

export const getClassById = async (req, res, next) => {
    try {
        const classData = await classService.getClassById(req.params.id);
        return res
            .status(200)
            .json(new ApiResponse(200, { status: 'success', data: { class: classData } }));
    } catch (error) {
        next(error);
    }
};

export const updateClass = async (req, res, next) => {
    try {
        const updatedClass = await classService.updateClass(req.params.id, req.body);
        return res
            .status(200)
            .json(new ApiResponse(200, { status: 'success', data: { class: updatedClass } }));
    } catch (error) {
        next(error);
    }
};

export const deleteClass = async (req, res, next) => {
    try {
        const result = await classService.deleteClass(req.params.id);
        return res
            .status(200)
            .json(new ApiResponse(200, { status: 'success', data: result }));
    } catch (error) {
        next(error);
    }
}; 