import { classService } from '../services/classService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
        const classes = await prisma.class.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        
        res.status(200).json({
            status: 'success',
            data: {
                classes
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getClasses = getAllClasses;

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

export const getSubjects = async (req, res, next) => {
    try {
        const subjects = await prisma.subject.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        
        res.status(200).json({
            status: 'success',
            data: {
                subjects
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getDesignations = async (req, res, next) => {
    try {
        const designations = await prisma.designation.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        
        res.status(200).json({
            status: 'success',
            data: {
                designations
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getSections = async (req, res, next) => {
    try {
        const { classId } = req.query;
        console.log('Request for sections with classId:', classId, 'type:', typeof classId);
        
        // Disable caching for this endpoint
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        let sections;
        
        if (classId) {
            // Convert string to number and handle potential parsing errors
            let parsedClassId;
            try {
                parsedClassId = parseInt(classId, 10);
                console.log('Parsed classId as number:', parsedClassId);
                
                if (isNaN(parsedClassId)) {
                    return res.status(400).json({
                        status: 'fail',
                        message: 'Invalid class ID format'
                    });
                }
            } catch (parseError) {
                console.error('Error parsing classId:', parseError);
                return res.status(400).json({
                    status: 'fail',
                    message: 'Invalid class ID format'
                });
            }
            
            console.log('Fetching sections for class ID:', parsedClassId);
            
            // Use a direct database query with the classId filter
            sections = await prisma.section.findMany({
                where: {
                    classId: parsedClassId
                },
                orderBy: {
                    name: 'asc'
                }
            });
            
            console.log(`Found ${sections.length} sections for class ID ${parsedClassId}`);
        } else {
            console.log('Fetching all sections');
            sections = await prisma.section.findMany({
                orderBy: {
                    name: 'asc'
                },
                include: {
                    class: true
                }
            });
            console.log(`Found ${sections.length} sections total`);
        }
        
        // Always return a valid response
        return res.status(200).json({
            status: 'success',
            timestamp: new Date().getTime(),
            data: {
                sections: sections || []
            }
        });
    } catch (error) {
        console.error('Error fetching sections:', error);
        // Don't pass the error to next() to avoid crashing the server
        // Instead, return a nice error response
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error while fetching sections',
            error: error.message
        });
    }
};

export const createSection = async (req, res, next) => {
    try {
        const { name, classId } = req.body;
        
        if (!name || !classId) {
            return res.status(400).json({
                status: 'fail',
                message: 'Section name and class ID are required'
            });
        }
        
        // Verify that the class exists
        const classExists = await prisma.class.findUnique({
            where: { id: parseInt(classId, 10) }
        });
        
        if (!classExists) {
            return res.status(404).json({
                status: 'fail',
                message: `Class with ID ${classId} not found`
            });
        }
        
        // Check if section with this name already exists for this class
        const existingSection = await prisma.section.findFirst({
            where: {
                name,
                classId: parseInt(classId, 10)
            }
        });
        
        if (existingSection) {
            return res.status(400).json({
                status: 'fail',
                message: `Section with name '${name}' already exists for this class`
            });
        }
        
        // Create the section
        const section = await prisma.section.create({
            data: {
                name,
                classId: parseInt(classId, 10)
            }
        });
        
        return res.status(201).json({
            status: 'success',
            data: { section }
        });
    } catch (error) {
        console.error('Error creating section:', error);
        next(error);
    }
}; 