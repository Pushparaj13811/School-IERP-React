import { sectionService } from '../services/sectionService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const createSection = async (req, res, next) => {
    try {
        const newSection = await sectionService.createSection(req.body);
        return res
            .status(201)
            .json(new ApiResponse(201, { status: 'success', data: { section: newSection } }));
    } catch (error) {
        next(error);
    }
};

export const getAllSections = async (req, res, next) => {
    try {
        const sections = await sectionService.getAllSections();
        return res
            .status(200)
            .json(new ApiResponse(200, { status: 'success', data: { sections } }));
    } catch (error) {
        next(error);
    }
};

export const getSectionById = async (req, res, next) => {
    try {
        const section = await sectionService.getSectionById(req.params.id);
        return res
            .status(200)
            .json(new ApiResponse(200, { status: 'success', data: { section } }));
    } catch (error) {
        next(error);
    }
};

export const updateSection = async (req, res, next) => {
    try {
        const updatedSection = await sectionService.updateSection(req.params.id, req.body);
        return res
            .status(200)
            .json(new ApiResponse(200, { status: 'success', data: { section: updatedSection } }));
    } catch (error) {
        next(error);
    }
};

export const deleteSection = async (req, res, next) => {
    try {
        const result = await sectionService.deleteSection(req.params.id);
        return res
            .status(200)
            .json(new ApiResponse(200, { status: 'success', data: result }));
    } catch (error) {
        next(error);
    }
};

export const getSectionsByClass = async (req, res, next) => {
    try {
        const sections = await sectionService.getSectionsByClass(req.params.classId);
        return res
            .status(200)
            .json(new ApiResponse(200, { status: 'success', data: { sections } }));
    } catch (error) {
        next(error);
    }
}; 