import express from 'express';
import { getProfile, updateProfile, updatePassword, updateProfilePicture, createUser, createStudent, createParent, createTeacher, getStudents, getParents, getTeachers, getUsers, getStudentById, getTeacherById, getParentById, updateStudent, updateParent, updateTeacher, updateProfilePictureById, downloadUserProfile, toggleUserActiveStatus, toggleStudentActiveStatus, toggleTeacherActiveStatus, toggleParentActiveStatus } from '../controller/userController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { createUploader } from '../middlewares/multerMiddleware.js';
import { ApiError } from '../utils/apiError.js';
import { validate, schemas, sanitize, validateId, validatePagination } from '../middlewares/validateRequest.js';
import { userCreationLimiter, uploadLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Apply sanitization to all routes
router.use(sanitize);

// Create a specific uploader for profile pictures
const profilePictureUploader = createUploader('profile-pictures');

// Custom error handler for multer
const handleProfilePictureUpload = (req, res, next) => {
    const multerSingle = profilePictureUploader.single('profilePicture');

    multerSingle(req, res, function (err) {
        if (err) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Multer error:', err);
            }
            if (err.code === 'LIMIT_FILE_SIZE') {
                return next(new ApiError(400, 'File size too large. Maximum size is 5MB'));
            }
            return next(new ApiError(400, `File upload error: ${err.message}`));
        }
        // No errors, proceed
        next();
    });
};

// Protect all routes
router.use(protect);

// Profile routes (own profile - any authenticated user)
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/password', validate(schemas.updatePassword), updatePassword);
router.patch('/profile-picture', uploadLimiter, handleProfilePictureUpload, updateProfilePicture);

// User creation routes - ADMIN ONLY with rate limiting and validation
router.post('/create', restrictTo('ADMIN'), userCreationLimiter, createUser);
router.post('/create-student', restrictTo('ADMIN'), userCreationLimiter, validate(schemas.createStudent), createStudent);
router.post('/create-parent', restrictTo('ADMIN'), userCreationLimiter, validate(schemas.createParent), createParent);
router.post('/create-teacher', restrictTo('ADMIN'), userCreationLimiter, validate(schemas.createTeacher), createTeacher);

// User listing routes - ADMIN and TEACHER only with pagination validation
router.get('/students', restrictTo('ADMIN', 'TEACHER'), validatePagination, getStudents);
router.get('/parents', restrictTo('ADMIN', 'TEACHER'), validatePagination, getParents);
router.get('/teachers', restrictTo('ADMIN'), validatePagination, getTeachers);
router.get('/all', restrictTo('ADMIN'), validatePagination, getUsers);

// Individual user routes - ADMIN and TEACHER only with ID validation
// Students can view their own profile, ADMIN and TEACHER can view any student
router.get('/students/:id', validateId, (req, res, next) => {
    const requestedId = Number(req.params.id);
    const isOwnProfile = req.user.role === 'STUDENT' && req.user.student?.id === requestedId;
    const isAuthorized = isOwnProfile || ['ADMIN', 'TEACHER'].includes(req.user.role);
    
    if (!isAuthorized) {
        return next(new ApiError(403, 'You do not have permission to view this student profile'));
    }
    next();
}, getStudentById);
router.get('/teachers/:id', restrictTo('ADMIN'), validateId, getTeacherById);
router.get('/parents/:id', restrictTo('ADMIN', 'TEACHER'), validateId, getParentById);

// User update routes - ADMIN ONLY with ID validation
router.patch('/students/:id', restrictTo('ADMIN'), validateId, updateStudent);
router.patch('/parents/:id', restrictTo('ADMIN'), validateId, updateParent);
router.patch('/teachers/:id', restrictTo('ADMIN'), validateId, updateTeacher);

// Profile picture upload routes for specific user roles - ADMIN ONLY with rate limiting
router.patch('/students/:id/profile-picture', restrictTo('ADMIN'), uploadLimiter, validateId, handleProfilePictureUpload, (req, res, next) => {
    req.params.userRole = 'STUDENT';
    next();
}, updateProfilePictureById);
router.patch('/parents/:id/profile-picture', restrictTo('ADMIN'), uploadLimiter, validateId, handleProfilePictureUpload, (req, res, next) => {
    req.params.userRole = 'PARENT';
    next();
}, updateProfilePictureById);
router.patch('/teachers/:id/profile-picture', restrictTo('ADMIN'), uploadLimiter, validateId, handleProfilePictureUpload, (req, res, next) => {
    req.params.userRole = 'TEACHER';
    next();
}, updateProfilePictureById);

// Download profile routes - requires specific role validation
router.get('/download-profile/:userRole/:id', downloadUserProfile);

// User activation/deactivation - ADMIN ONLY
router.patch('/users/:userId/status', restrictTo('ADMIN'), toggleUserActiveStatus);
router.patch('/students/:studentId/status', restrictTo('ADMIN'), toggleStudentActiveStatus);
router.patch('/teachers/:teacherId/status', restrictTo('ADMIN'), toggleTeacherActiveStatus);
router.patch('/parents/:parentId/status', restrictTo('ADMIN'), toggleParentActiveStatus);

export default router; 