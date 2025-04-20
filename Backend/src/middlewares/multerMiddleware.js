import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Base uploads directory
const baseUploadsDir = 'uploads/';

// Function to ensure a directory exists
const ensureDirectoryExists = (directory) => {
    try {
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
            console.log(`Created directory: ${directory}`);
        } else {
            // Check if directory is writable
            fs.accessSync(directory, fs.constants.W_OK);
            console.log(`Directory ${directory} is writable`);
        }
        return true;
    } catch (err) {
        console.error(`Error with directory ${directory}: ${err.message}`);
        return false;
    }
};

// Ensure base uploads directory exists
ensureDirectoryExists(baseUploadsDir);

// Create storage factory function that accepts a subdirectory
const createStorage = (subDirectory = '') => {
    const uploadPath = path.join(baseUploadsDir, subDirectory);
    
    // Ensure the specific upload directory exists
    ensureDirectoryExists(uploadPath);
    
    return multer.diskStorage({
        destination: function (req, file, cb) {
            // Double-check directory exists when handling upload
            if (!fs.existsSync(uploadPath)) {
                return cb(new Error(`Upload directory ${uploadPath} does not exist`), null);
            }
            cb(null, uploadPath);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = file.originalname.split('.').pop();
            cb(null, file.fieldname + '-' + uniqueSuffix + '.' + ext);
        }
    });
};

const fileFilter = (req, file, cb) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Only JPEG, JPG and PNG images are allowed'), false);
    }
    cb(null, true);
};

// Create multer instance factory
const createUploader = (subDirectory = '') => {
    return multer({
        storage: createStorage(subDirectory),
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB limit
        },
        fileFilter: fileFilter
    });
};

// Default uploader (for backward compatibility)
const upload = createUploader();

// Export both the default uploader and the factory function
export default upload;
export { createUploader };