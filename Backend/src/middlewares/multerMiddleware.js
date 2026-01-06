import multer from 'multer';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/config.js';

// Base uploads directory
const baseUploadsDir = 'uploads/';

/**
 * Allowed file configurations by category
 */
const fileCategories = {
    image: {
        mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
        maxSize: 5 * 1024 * 1024, // 5MB
        description: 'Images (JPEG, PNG, GIF, WebP)'
    },
    document: {
        mimeTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ],
        extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
        maxSize: 10 * 1024 * 1024, // 10MB
        description: 'Documents (PDF, Word, Excel, PowerPoint)'
    },
    profilePicture: {
        mimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
        extensions: ['.jpg', '.jpeg', '.png'],
        maxSize: 2 * 1024 * 1024, // 2MB
        description: 'Profile pictures (JPEG, PNG only, max 2MB)'
    }
};

/**
 * Function to ensure a directory exists
 */
const ensureDirectoryExists = (directory) => {
    try {
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
        } else {
            // Check if directory is writable
            fs.accessSync(directory, fs.constants.W_OK);
        }
        return true;
    } catch (err) {
        if (config.env === 'development') {
            console.error(`Error with directory ${directory}: ${err.message}`);
        }
        return false;
    }
};

// Ensure base uploads directory exists
ensureDirectoryExists(baseUploadsDir);

/**
 * Generate secure random filename
 */
const generateSecureFilename = (originalname) => {
    const ext = path.extname(originalname).toLowerCase();
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    return `${timestamp}-${randomBytes}${ext}`;
};

/**
 * Validate file extension matches MIME type
 */
const validateExtensionMimeMatch = (mimetype, originalname, category) => {
    const ext = path.extname(originalname).toLowerCase();
    const categoryConfig = fileCategories[category];

    if (!categoryConfig) {
        return { valid: false, message: 'Invalid file category' };
    }

    // Check if extension is allowed
    if (!categoryConfig.extensions.includes(ext)) {
        return {
            valid: false,
            message: `File extension ${ext} is not allowed. Allowed: ${categoryConfig.extensions.join(', ')}`
        };
    }

    // Check if MIME type is allowed
    if (!categoryConfig.mimeTypes.includes(mimetype)) {
        return {
            valid: false,
            message: `File type ${mimetype} is not allowed. Allowed: ${categoryConfig.description}`
        };
    }

    // Cross-validate MIME type matches extension
    const mimeToExtMap = {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/jpg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/gif': ['.gif'],
        'image/webp': ['.webp'],
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'application/vnd.ms-powerpoint': ['.ppt'],
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
    };

    const allowedExts = mimeToExtMap[mimetype];
    if (allowedExts && !allowedExts.includes(ext)) {
        return {
            valid: false,
            message: `File extension ${ext} does not match MIME type ${mimetype}. Possible file tampering detected.`
        };
    }

    return { valid: true };
};

/**
 * Create storage factory function
 */
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
            // Use secure random filename
            const secureFilename = generateSecureFilename(file.originalname);
            cb(null, secureFilename);
        }
    });
};

/**
 * Create file filter for specific category
 */
const createFileFilter = (category) => {
    return (req, file, cb) => {
        const validation = validateExtensionMimeMatch(file.mimetype, file.originalname, category);

        if (!validation.valid) {
            return cb(new Error(validation.message), false);
        }

        cb(null, true);
    };
};

/**
 * Create multer instance factory
 * @param {Object} options - Configuration options
 * @param {string} options.subDirectory - Subdirectory for uploads
 * @param {string} options.category - File category ('image', 'document', 'profilePicture')
 * @param {number} options.maxSize - Maximum file size in bytes (optional, uses category default)
 */
const createUploader = (options = {}) => {
    const {
        subDirectory = '',
        category = 'image',
        maxSize
    } = options;

    const categoryConfig = fileCategories[category] || fileCategories.image;

    return multer({
        storage: createStorage(subDirectory),
        limits: {
            fileSize: maxSize || categoryConfig.maxSize,
            files: 5 // Maximum 5 files per request
        },
        fileFilter: createFileFilter(category)
    });
};

/**
 * Profile picture uploader - stricter validation
 */
export const profilePictureUploader = createUploader({
    subDirectory: 'profile-pictures',
    category: 'profilePicture'
});

/**
 * Document uploader - for reports, certificates, etc.
 */
export const documentUploader = createUploader({
    subDirectory: 'documents',
    category: 'document'
});

/**
 * General image uploader
 */
export const imageUploader = createUploader({
    subDirectory: 'images',
    category: 'image'
});

/**
 * Announcement attachment uploader
 */
export const announcementUploader = createUploader({
    subDirectory: 'announcements',
    category: 'document'
});

// Default uploader (for backward compatibility) - uses profile picture settings
const upload = profilePictureUploader;

// Export both the default uploader and the factory function
export default upload;
export { createUploader, fileCategories };
