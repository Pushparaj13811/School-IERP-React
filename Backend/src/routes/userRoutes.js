import express from 'express';
import { getProfile, updateProfile, updatePassword, updateProfilePicture, createUser, createStudent, createParent, createTeacher, getStudents, getParents, getTeachers, getUsers, getStudentById, getTeacherById, getParentById, updateStudent, updateParent, updateTeacher, updateProfilePictureById } from '../controller/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import upload, { createUploader } from '../middlewares/multerMiddleware.js';
import { ApiError } from '../utils/apiError.js';

const router = express.Router();

// Create a specific uploader for profile pictures
const profilePictureUploader = createUploader('profile-pictures');

// Custom error handler for multer
const handleProfilePictureUpload = (req, res, next) => {
    const multerSingle = profilePictureUploader.single('profilePicture');
    
    multerSingle(req, res, function(err) {
        if (err) {
            console.error('Multer error:', err);
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(new ApiError(400, 'File size too large. Maximum size is 5MB'));
                }
                return next(new ApiError(400, `Upload error: ${err.message}`));
            }
            return next(new ApiError(400, `File upload error: ${err.message}`));
        }
        // No errors, proceed
        next();
    });
};


// Protect all routes
router.use(protect);

// Profile routes
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.patch('/password', updatePassword);
router.patch('/profile-picture', handleProfilePictureUpload, updateProfilePicture);

// User creation routes
router.post('/create', createUser);
router.post('/create-student', createStudent);
router.post('/create-parent', createParent);
router.post('/create-teacher', createTeacher);

// User listing routes
router.get('/students', getStudents);
router.get('/parents', getParents);
router.get('/teachers', getTeachers);
router.get('/all', getUsers);
router.get('/students/:id', getStudentById);
router.get('/teachers/:id', getTeacherById);
router.get('/parents/:id', getParentById);

// User update routes
router.patch('/students/:id', updateStudent);
router.patch('/parents/:id', updateParent);
router.patch('/teachers/:id', updateTeacher);

// Profile picture upload routes for specific user roles
router.patch('/students/:id/profile-picture', handleProfilePictureUpload, (req, res, next) => {
    req.params.userRole = 'STUDENT';
    next();
}, updateProfilePictureById);
router.patch('/parents/:id/profile-picture', handleProfilePictureUpload, (req, res, next) => {
    req.params.userRole = 'PARENT';
    next();
}, updateProfilePictureById);
router.patch('/teachers/:id/profile-picture', handleProfilePictureUpload, (req, res, next) => {
    req.params.userRole = 'TEACHER';
    next();
}, updateProfilePictureById);

export default router; 