import { sectionService } from '../services/sectionService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
        const { classId } = req.params;
        console.log('Getting sections by class ID:', classId, 'type:', typeof classId);
        
        // Disable caching for this endpoint
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        if (!classId) {
            return res.status(400).json({
                status: 'fail',
                message: 'Class ID is required'
            });
        }
        
        const parsedClassId = parseInt(classId, 10);
        if (isNaN(parsedClassId)) {
            return res.status(400).json({
                status: 'fail',
                message: 'Invalid class ID format'
            });
        }
        
        // First check if the class exists
        const classExists = await prisma.class.findUnique({
            where: { id: parsedClassId }
        });
        
        if (!classExists) {
            return res.status(404).json({
                status: 'fail',
                message: `Class with ID ${parsedClassId} not found`
            });
        }
        
        // Now find sections for this class
        const sections = await prisma.section.findMany({
            where: {
                classId: parsedClassId
            },
            orderBy: {
                name: 'asc'
            }
        });
        
        console.log(`Found ${sections.length} sections for class ID ${parsedClassId}`);
        
        return res.status(200).json({
            status: 'success',
            timestamp: new Date().getTime(),
            data: {
                sections: sections || []
            }
        });
    } catch (error) {
        console.error('Error getting sections by class:', error);
        next(error);
    }
}; 