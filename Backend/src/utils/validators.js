import { AppError } from '../middlewares/errorHandler.js';

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        throw new AppError(400, 'Please provide a valid email address');
    }
    return true;
};

export const validatePassword = (password) => {
    if (!password || password.length < 8) {
        throw new AppError(400, 'Password must be at least 8 characters long');
    }
    return true;
};

export const validateRole = (role) => {
    const validRoles = ['STUDENT', 'TEACHER', 'ADMIN', 'PARENT'];
    if (!role || !validRoles.includes(role)) {
        throw new AppError(400, 'Please provide a valid role (STUDENT, TEACHER, ADMIN, PARENT)');
    }
    return true;
};

export const validateName = (name) => {
    if (!name || name.length < 2) {
        throw new AppError(400, 'Name must be at least 2 characters long');
    }
    return true;
};

export const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phone || !phoneRegex.test(phone)) {
        throw new AppError(400, 'Please provide a valid 10-digit phone number');
    }
    return true;
};

export const validateDate = (date) => {
    if (!date || isNaN(new Date(date).getTime())) {
        throw new AppError(400, 'Please provide a valid date');
    }
    return true;
};

export const validateAddress = (address) => {
    const requiredFields = ['addressLine1', 'city', 'ward', 'municipality', 'district', 'province'];
    for (const field of requiredFields) {
        if (!address[field]) {
            throw new AppError(400, `Please provide ${field} in the address`);
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
            throw new AppError(400, `Please provide ${field} for student registration`);
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
            throw new AppError(400, `Please provide ${field} for teacher registration`);
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
            throw new AppError(400, `Please provide ${field} for admin registration`);
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
            throw new AppError(400, `Please provide ${field} for parent registration`);
        }
    }

    validateName(data.name);
    validatePhone(data.contactNo);
    
    return true;
}; 