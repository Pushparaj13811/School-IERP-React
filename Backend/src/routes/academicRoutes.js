import express from 'express';
import {
    createClass,
    getAllClasses,
    getClassById,
    updateClass,
    deleteClass,
    getSubjects,
    getDesignations
} from '../controller/classController.js';
import { getSectionsByClass } from '../controller/sectionController.js';
import { getSubjectsByClassId } from '../controller/subjectController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Protect all routes
router.use(protect);

// Class Routes
router
    .route('/classes')
    .post(restrictTo('ADMIN'), createClass)
    .get(getAllClasses);

router
    .route('/classes/:id')
    .get(getClassById)
    .patch(restrictTo('ADMIN'), updateClass)
    .delete(restrictTo('ADMIN'), deleteClass);

// Legacy routes for backward compatibility
router.get('/classes/:classId/sections', getSectionsByClass);

// Additional routes
router.get('/sections', async (req, res, next) => {
    // Get the classId from query parameters and pass it as path parameter
    const { classId } = req.query;
    if (classId) {
        // Reuse the same controller but pass classId as a parameter
        req.params.classId = classId;
        return getSectionsByClass(req, res, next);
    } else {
        // If no classId is provided, get all sections
        try {
            const sections = await prisma.section.findMany({
                orderBy: {
                    name: 'asc'
                }
            });
            return res.status(200).json({
                status: 'success',
                data: {
                    sections
                }
            });
        } catch (error) {
            console.error('Error getting all sections:', error);
            next(error);
        }
    }
});
router.get('/subjects', getSubjects);
router.get('/subjects/class/:classId', getSubjectsByClassId);
router.get('/designations', getDesignations);

export default router; 