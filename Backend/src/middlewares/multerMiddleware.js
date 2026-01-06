import multer from 'multer';
import sharp from 'sharp';
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
        description: 'Images (JPEG, PNG, GIF, WebP)',
        convertToWebP: true,
        webpQuality: 85
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
        description: 'Documents (PDF, Word, Excel, PowerPoint)',
        convertToWebP: false
    },
    profilePicture: {
        mimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        extensions: ['.jpg', '.jpeg', '.png', '.webp'],
        maxSize: 2 * 1024 * 1024, // 2MB
        description: 'Profile pictures (JPEG, PNG, WebP only, max 2MB)',
        convertToWebP: true,
        webpQuality: 85,
        resize: {
            width: 800,
            height: 800,
            fit: 'inside'
        }
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

    if (!categoryConfig.extensions.includes(ext)) {
        return {
            valid: false,
            message: `File extension ${ext} is not allowed. Allowed: ${categoryConfig.extensions.join(', ')}`
        };
    }

    if (!categoryConfig.mimeTypes.includes(mimetype)) {
        return {
            valid: false,
            message: `File type ${mimetype} is not allowed. Allowed: ${categoryConfig.description}`
        };
    }

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
 * Process uploaded file with Sharp and convert to WebP
 */
const processWithSharp = async (filePath, categoryConfig) => {
    try {
        const fileExt = path.extname(filePath).toLowerCase();
        
        // Skip if already WebP and no resize needed
        if (fileExt === '.webp' && !categoryConfig.resize) {
            return;
        }

        const fileDir = path.dirname(filePath);
        const baseFilename = path.basename(filePath, fileExt);
        const webpFilename = `${baseFilename}.webp`;
        const webpPath = path.join(fileDir, webpFilename);

        let sharpInstance = sharp(filePath);

        // Apply resize if configured
        if (categoryConfig.resize) {
            sharpInstance = sharpInstance.resize({
                width: categoryConfig.resize.width,
                height: categoryConfig.resize.height,
                fit: categoryConfig.resize.fit || 'inside',
                withoutEnlargement: true
            });
        }

        // Convert to WebP
        await sharpInstance
            .webp({
                quality: categoryConfig.webpQuality || 85,
                effort: 6
            })
            .toFile(webpPath);

        // Delete original file
        if (fileExt !== '.webp') {
            fs.unlinkSync(filePath);
        }

        return webpPath;
    } catch (error) {
        console.error('Sharp processing error:', error);
        return filePath;
    }
};

/**
 * Create storage factory function
 */
const createStorage = (subDirectory = '') => {
    const uploadPath = path.join(baseUploadsDir, subDirectory);
    ensureDirectoryExists(uploadPath);

    return multer.diskStorage({
        destination: function (req, file, cb) {
            if (!fs.existsSync(uploadPath)) {
                return cb(new Error(`Upload directory ${uploadPath} does not exist`), null);
            }
            cb(null, uploadPath);
        },
        filename: function (req, file, cb) {
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
 * Create wrapper that converts multer middleware to handle Sharp processing
 */
const wrapWithSharpProcessing = (multerMiddleware, category) => {
    const categoryConfig = fileCategories[category];
    
    return async (req, res, next) => {
        multerMiddleware(req, res, async (err) => {
            if (err) {
                return next(err);
            }

            // Skip Sharp processing for non-image categories
            if (!categoryConfig?.convertToWebP) {
                return next();
            }

            try {
                // Process single file
                if (req.file) {
                    const webpPath = await processWithSharp(req.file.path, categoryConfig);
                    if (webpPath && webpPath !== req.file.path) {
                        req.file.path = webpPath;
                        req.file.filename = path.basename(webpPath);
                        req.file.mimetype = 'image/webp';
                        const stats = fs.statSync(webpPath);
                        req.file.size = stats.size;
                    }
                }

                // Process array of files
                if (req.files && Array.isArray(req.files)) {
                    for (let i = 0; i < req.files.length; i++) {
                        const webpPath = await processWithSharp(req.files[i].path, categoryConfig);
                        if (webpPath && webpPath !== req.files[i].path) {
                            req.files[i].path = webpPath;
                            req.files[i].filename = path.basename(webpPath);
                            req.files[i].mimetype = 'image/webp';
                            const stats = fs.statSync(webpPath);
                            req.files[i].size = stats.size;
                        }
                    }
                }

                // Process object-based files (multiple fields)
                if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
                    for (const fieldName in req.files) {
                        const filesArray = req.files[fieldName];
                        for (let i = 0; i < filesArray.length; i++) {
                            const webpPath = await processWithSharp(filesArray[i].path, categoryConfig);
                            if (webpPath && webpPath !== filesArray[i].path) {
                                req.files[fieldName][i].path = webpPath;
                                req.files[fieldName][i].filename = path.basename(webpPath);
                                req.files[fieldName][i].mimetype = 'image/webp';
                                const stats = fs.statSync(webpPath);
                                req.files[fieldName][i].size = stats.size;
                            }
                        }
                    }
                }

                next();
            } catch (error) {
                console.error('Sharp processing middleware error:', error);
                next(error);
            }
        });
    };
};

/**
 * Create multer instance factory with Sharp processing wrapper
 */
const createUploader = (options = {}) => {
    const {
        subDirectory = '',
        category = 'image',
        maxSize
    } = options;

    const categoryConfig = fileCategories[category] || fileCategories.image;

    const multerInstance = multer({
        storage: createStorage(subDirectory),
        limits: {
            fileSize: maxSize || categoryConfig.maxSize,
            files: 5
        },
        fileFilter: createFileFilter(category)
    });

    // Return wrapped methods that include Sharp processing
    return {
        single: (fieldName) => wrapWithSharpProcessing(multerInstance.single(fieldName), category),
        array: (fieldName, maxCount) => wrapWithSharpProcessing(multerInstance.array(fieldName, maxCount), category),
        fields: (fields) => wrapWithSharpProcessing(multerInstance.fields(fields), category),
        any: () => wrapWithSharpProcessing(multerInstance.any(), category),
        none: () => multerInstance.none()
    };
};

/**
 * Profile picture uploader - with WebP conversion and resize
 */
export const profilePictureUploader = createUploader({
    subDirectory: 'profiles',
    category: 'profilePicture'
});

/**
 * Document uploader - no conversion
 */
export const documentUploader = createUploader({
    subDirectory: 'documents',
    category: 'document'
});

/**
 * General image uploader with WebP conversion
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

// Default uploader
const upload = profilePictureUploader;

export default upload;
export { createUploader, fileCategories };