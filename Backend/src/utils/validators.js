import { ApiError } from './apiError.js';

/**
 * Sanitize email input - trim whitespace and convert to lowercase
 * @param {string} email - The email to sanitize
 * @returns {string} - Sanitized email
 */
export const sanitizeEmail = (email) => {
    if (!email || typeof email !== 'string') {
        return '';
    }
    return email.trim().toLowerCase();
};

/**
 * Sanitize general string input - trim whitespace
 * @param {string} input - The string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeInput = (input) => {
    if (!input || typeof input !== 'string') {
        return '';
    }
    return input.trim();
};

/**
 * Validate email format - permissive validation accepting various email formats
 * Accepts: user@domain.com, User@Domain.COM, user.name+tag@domain.co.uk, etc.
 * @param {string} email - The email to validate
 * @returns {boolean}
 */
export const validateEmail = (email) => {
    // More permissive email regex that accepts:
    // - Various TLDs (.com, .co.uk, .museum, etc.)
    // - Subdomains
    // - Plus addressing (user+tag@domain.com)
    // - Dots in local part
    // - Numbers and hyphens in domain
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email || typeof email !== 'string') {
        throw new ApiError(400, 'Please provide an email address');
    }

    const sanitizedEmail = sanitizeEmail(email);

    if (!emailRegex.test(sanitizedEmail)) {
        throw new ApiError(400, 'Please provide a valid email address');
    }
    return true;
};

/**
 * Validate password strength - used for registration and password reset
 * @param {string} password - The password to validate
 * @returns {boolean}
 */
export const validatePassword = (password) => {
    // Check if password is at least 8 chars and contains uppercase, lowercase, number, and special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
    if (!password || !passwordRegex.test(password)) {
        throw new ApiError(400, 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }
    return true;
};

/**
 * Validate password exists - used for login (doesn't check strength)
 * @param {string} password - The password to validate
 * @returns {boolean}
 */
export const validatePasswordExists = (password) => {
    if (!password || typeof password !== 'string' || password.trim().length === 0) {
        throw new ApiError(400, 'Please provide a password');
    }
    return true;
};

export const validateRole = (role) => {
    const validRoles = ['STUDENT', 'TEACHER', 'ADMIN', 'PARENT'];
    if (!role || !validRoles.includes(role)) {
        throw new ApiError(400, 'Please provide a valid role (STUDENT, TEACHER, ADMIN, PARENT)');
    }
    return true;
};

export const validateName = (name) => {
    if (!name || name.length < 2) {
        throw new ApiError(400, 'Name must be at least 2 characters long');
    }
    return true;
};

export const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phone || !phoneRegex.test(phone)) {
        throw new ApiError(400, 'Please provide a valid 10-digit phone number');
    }
    return true;
};

export const validateDate = (date) => {
    if (!date || isNaN(new Date(date).getTime())) {
        throw new ApiError(400, 'Please provide a valid date');
    }
    return true;
};

export const validateAddress = (address) => {
    const requiredFields = ['addressLine1', 'city', 'ward', 'municipality', 'district', 'province'];
    for (const field of requiredFields) {
        if (!address[field]) {
            throw new ApiError(400, `Please provide ${field} in the address`);
        }
    }

    // Set default values for optional fields
    address.street = address.street || '';
    address.addressLine2 = address.addressLine2 || '';
    address.postalCode = address.postalCode || '';
    address.country = address.country || 'Nepal';

    return true;
};

export const validateStudentData = (data) => {
    const requiredFields = [
        'name', 'nameAsPerBirth', 'gender', 'contactNo', 'emergencyContact',
        'dateOfBirth', 'rollNo', 'fatherName', 'motherName', 'classId', 'sectionId', 'parentId'
    ];
    
    for (const field of requiredFields) {
        if (!data[field]) {
            throw new ApiError(400, `Please provide ${field} for student registration`);
        }
    }

    validateName(data.name);
    validateName(data.nameAsPerBirth);
    validatePhone(data.contactNo);
    validatePhone(data.emergencyContact);
    validateDate(data.dateOfBirth);
    
    return true;
};

export const validateTeacherData = (data) => {
    const requiredFields = [
        'name', 'gender', 'contactNo', 'emergencyContact',
        'dateOfBirth', 'joinDate', 'designationId'
    ];
    
    for (const field of requiredFields) {
        if (!data[field]) {
            throw new ApiError(400, `Please provide ${field} for teacher registration`);
        }
    }

    validateName(data.name);
    validatePhone(data.contactNo);
    validatePhone(data.emergencyContact);
    validateDate(data.dateOfBirth);
    validateDate(data.joinDate);
    
    return true;
};

export const validateAdminData = (data) => {
    const requiredFields = [
        'fullName', 'phone', 'dateOfBirth', 'emergencyContact', 'joinDate'
    ];
    
    for (const field of requiredFields) {
        if (!data[field]) {
            throw new ApiError(400, `Please provide ${field} for admin registration`);
        }
    }

    validateName(data.fullName);
    validatePhone(data.phone);
    validatePhone(data.emergencyContact);
    validateDate(data.dateOfBirth);
    validateDate(data.joinDate);
    
    return true;
};

export const validateParentData = (data) => {
    const requiredFields = ['name', 'gender', 'contactNo'];
    
    for (const field of requiredFields) {
        if (!data[field]) {
            throw new ApiError(400, `Please provide ${field} for parent registration`);
        }
    }

    validateName(data.name);
    validatePhone(data.contactNo);
    
    return true;
}; 