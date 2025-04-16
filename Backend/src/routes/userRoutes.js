import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { getProfile, updateProfile, updatePassword, updateProfilePicture, createUser, createStudent, createParent, createTeacher, getStudents, getParents, getTeachers, getUsers, getStudentById, getTeacherById, getParentById, updateStudent, updateParent, updateTeacher, updateProfilePictureById } from '../controller/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { AppError } from '../middlewares/errorHandler.js';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = 'uploads/profiles';
try {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log(`Created directory: ${uploadsDir}`);
    } else {
        // Check if directory is writable
        fs.accessSync(uploadsDir, fs.constants.W_OK);
        console.log(`Directory ${uploadsDir} is writable`);
    }
} catch (err) {
    console.error(`Error with uploads directory: ${err.message}`);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Double-check directory exists when handling upload
        if (!fs.existsSync(uploadsDir)) {
            return cb(new Error(`Upload directory ${uploadsDir} does not exist`), null);
        }
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = file.originalname.split('.').pop();
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext);
    }
});

const fileFilter = (req, file, cb) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Only JPEG, JPG and PNG images are allowed'), false);
    }
    cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

// Custom error handler for multer
const handleMulterUpload = (req, res, next) => {
    const multerSingle = upload.single('profilePicture');
    
    multerSingle(req, res, function(err) {
        if (err) {
            console.error('Multer error:', err);
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(new AppError(400, 'File size too large. Maximum size is 5MB'));
                }
                return next(new AppError(400, `Upload error: ${err.message}`));
            }
            return next(new AppError(400, `File upload error: ${err.message}`));
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
router.patch('/profile-picture', handleMulterUpload, updateProfilePicture);

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
router.patch('/students/:id/profile-picture', handleMulterUpload, (req, res, next) => {
    req.params.userRole = 'STUDENT';
    next();
}, updateProfilePictureById);
router.patch('/parents/:id/profile-picture', handleMulterUpload, (req, res, next) => {
    req.params.userRole = 'PARENT';
    next();
}, updateProfilePictureById);
router.patch('/teachers/:id/profile-picture', handleMulterUpload, (req, res, next) => {
    req.params.userRole = 'TEACHER';
    next();
}, updateProfilePictureById);

export default router; 