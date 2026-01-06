import { ApiError } from '../utils/apiError.js';

/**
 * Input validation middleware factory
 * Creates middleware that validates request data against a schema
 */

// Common validation patterns
const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/,
    phone: /^[0-9]{10,15}$/,
    date: /^\d{4}-\d{2}-\d{2}$/,
    positiveInt: /^[1-9]\d*$/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    name: /^[a-zA-Z\s'-]{2,100}$/,
};

/**
 * Sanitize string input - remove potentially dangerous characters
 */
const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str
        .trim()
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Recursively sanitize object values
 */
const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') return sanitizeString(obj);
    if (Array.isArray(obj)) return obj.map(sanitizeObject);
    if (typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitized[sanitizeString(key)] = sanitizeObject(value);
        }
        return sanitized;
    }
    return obj;
};

/**
 * Validation rules builder
 */
export const rules = {
    required: (fieldName) => ({
        validate: (value) => value !== undefined && value !== null && value !== '',
        message: `${fieldName} is required`
    }),

    email: (fieldName = 'Email') => ({
        validate: (value) => !value || patterns.email.test(value),
        message: `${fieldName} must be a valid email address`
    }),

    password: (fieldName = 'Password') => ({
        validate: (value) => !value || patterns.password.test(value),
        message: `${fieldName} must be at least 8 characters with uppercase, lowercase, number, and special character`
    }),

    minLength: (min, fieldName) => ({
        validate: (value) => !value || String(value).length >= min,
        message: `${fieldName} must be at least ${min} characters`
    }),

    maxLength: (max, fieldName) => ({
        validate: (value) => !value || String(value).length <= max,
        message: `${fieldName} must be at most ${max} characters`
    }),

    phone: (fieldName = 'Phone number') => ({
        validate: (value) => !value || patterns.phone.test(value),
        message: `${fieldName} must be a valid phone number (10-15 digits)`
    }),

    date: (fieldName = 'Date') => ({
        validate: (value) => {
            if (!value) return true;
            const date = new Date(value);
            return !isNaN(date.getTime());
        },
        message: `${fieldName} must be a valid date`
    }),

    positiveInt: (fieldName) => ({
        validate: (value) => {
            if (value === undefined || value === null || value === '') return true;
            const num = Number(value);
            return Number.isInteger(num) && num > 0;
        },
        message: `${fieldName} must be a positive integer`
    }),

    enum: (allowedValues, fieldName) => ({
        validate: (value) => !value || allowedValues.includes(value),
        message: `${fieldName} must be one of: ${allowedValues.join(', ')}`
    }),

    array: (fieldName) => ({
        validate: (value) => !value || Array.isArray(value),
        message: `${fieldName} must be an array`
    }),

    boolean: (fieldName) => ({
        validate: (value) => value === undefined || typeof value === 'boolean',
        message: `${fieldName} must be a boolean`
    }),

    number: (fieldName) => ({
        validate: (value) => {
            if (value === undefined || value === null || value === '') return true;
            return !isNaN(Number(value));
        },
        message: `${fieldName} must be a number`
    }),

    min: (min, fieldName) => ({
        validate: (value) => {
            if (value === undefined || value === null || value === '') return true;
            return Number(value) >= min;
        },
        message: `${fieldName} must be at least ${min}`
    }),

    max: (max, fieldName) => ({
        validate: (value) => {
            if (value === undefined || value === null || value === '') return true;
            return Number(value) <= max;
        },
        message: `${fieldName} must be at most ${max}`
    }),
};

/**
 * Create validation middleware
 * @param {Object} schema - Validation schema { fieldName: [rules] }
 * @param {string} source - Request property to validate ('body', 'query', 'params')
 */
export const validate = (schema, source = 'body') => {
    return (req, res, next) => {
        const data = req[source];
        const errors = [];

        // Sanitize input first
        req[source] = sanitizeObject(data);

        // Validate each field
        for (const [field, fieldRules] of Object.entries(schema)) {
            const value = req[source][field];

            for (const rule of fieldRules) {
                if (!rule.validate(value)) {
                    errors.push(rule.message);
                    break; // Stop at first error for this field
                }
            }
        }

        if (errors.length > 0) {
            return next(new ApiError(400, 'Validation failed', errors));
        }

        next();
    };
};

/**
 * Sanitization-only middleware (no validation rules)
 */
export const sanitize = (req, res, next) => {
    if (req.body) req.body = sanitizeObject(req.body);
    if (req.query) req.query = sanitizeObject(req.query);
    if (req.params) req.params = sanitizeObject(req.params);
    next();
};

/**
 * Additional validation rules
 */
rules.dateRange = (fromField, toField) => ({
    validate: (value, data) => {
        const from = data[fromField];
        const to = data[toField];
        if (!from || !to) return true;
        return new Date(from) <= new Date(to);
    },
    message: `${fromField} must be before or equal to ${toField}`
});

rules.futureDateOrToday = (fieldName) => ({
    validate: (value) => {
        if (!value) return true;
        const date = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
    },
    message: `${fieldName} must be today or in the future`
});

rules.pastDateOrToday = (fieldName) => ({
    validate: (value) => {
        if (!value) return true;
        const date = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return date <= today;
    },
    message: `${fieldName} must be today or in the past`
});

rules.month = (fieldName = 'Month') => ({
    validate: (value) => {
        if (value === undefined || value === null || value === '') return true;
        const num = Number(value);
        return Number.isInteger(num) && num >= 1 && num <= 12;
    },
    message: `${fieldName} must be between 1 and 12`
});

rules.year = (fieldName = 'Year') => ({
    validate: (value) => {
        if (value === undefined || value === null || value === '') return true;
        const num = Number(value);
        return Number.isInteger(num) && num >= 2000 && num <= 2100;
    },
    message: `${fieldName} must be a valid year (2000-2100)`
});

rules.dayOfWeek = (fieldName = 'Day of week') => ({
    validate: (value) => {
        if (value === undefined || value === null || value === '') return true;
        const num = Number(value);
        return Number.isInteger(num) && num >= 0 && num <= 6;
    },
    message: `${fieldName} must be between 0 (Sunday) and 6 (Saturday)`
});

rules.time = (fieldName = 'Time') => ({
    validate: (value) => {
        if (!value) return true;
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
    },
    message: `${fieldName} must be in HH:MM format (24-hour)`
});

rules.academicYear = (fieldName = 'Academic year') => ({
    validate: (value) => {
        if (!value) return true;
        return /^\d{4}-\d{4}$/.test(value);
    },
    message: `${fieldName} must be in YYYY-YYYY format`
});

rules.arrayOf = (itemValidator, fieldName) => ({
    validate: (value) => {
        if (!value) return true;
        if (!Array.isArray(value)) return false;
        return value.every(item => itemValidator.validate(item));
    },
    message: `${fieldName} contains invalid items`
});

rules.nonEmptyArray = (fieldName) => ({
    validate: (value) => {
        if (!value) return true;
        return Array.isArray(value) && value.length > 0;
    },
    message: `${fieldName} must be a non-empty array`
});

rules.marksLessThanOrEqual = (maxField, fieldName) => ({
    validate: (value, data) => {
        if (value === undefined || value === null || value === '') return true;
        const maxValue = data[maxField];
        if (maxValue === undefined || maxValue === null) return true;
        return Number(value) <= Number(maxValue);
    },
    message: `${fieldName} cannot exceed ${maxField}`
});

/**
 * Common validation schemas
 */
export const schemas = {
    // Auth schemas
    login: {
        email: [rules.required('Email'), rules.email()],
        password: [rules.required('Password')]
    },

    register: {
        email: [rules.required('Email'), rules.email()],
        password: [rules.required('Password'), rules.password()],
        role: [rules.required('Role'), rules.enum(['STUDENT', 'TEACHER', 'ADMIN', 'PARENT'], 'Role')]
    },

    forgotPassword: {
        email: [rules.required('Email'), rules.email()]
    },

    resetPassword: {
        newPassword: [rules.required('New password'), rules.password()],
        confirmPassword: [rules.required('Confirm password')]
    },

    // User schemas
    createStudent: {
        email: [rules.required('Email'), rules.email()],
        name: [rules.required('Name'), rules.minLength(2, 'Name'), rules.maxLength(100, 'Name')],
        gender: [rules.required('Gender'), rules.enum(['MALE', 'FEMALE', 'OTHER'], 'Gender')],
        dateOfBirth: [rules.required('Date of birth'), rules.date('Date of birth'), rules.pastDateOrToday('Date of birth')],
        contactNo: [rules.required('Contact number'), rules.phone()],
        classId: [rules.required('Class ID'), rules.positiveInt('Class ID')],
        sectionId: [rules.required('Section ID'), rules.positiveInt('Section ID')]
    },

    createTeacher: {
        email: [rules.required('Email'), rules.email()],
        name: [rules.required('Name'), rules.minLength(2, 'Name'), rules.maxLength(100, 'Name')],
        gender: [rules.required('Gender'), rules.enum(['MALE', 'FEMALE', 'OTHER'], 'Gender')],
        dateOfBirth: [rules.required('Date of birth'), rules.date('Date of birth'), rules.pastDateOrToday('Date of birth')],
        contactNo: [rules.required('Contact number'), rules.phone()],
        designationId: [rules.required('Designation ID'), rules.positiveInt('Designation ID')]
    },

    createParent: {
        email: [rules.required('Email'), rules.email()],
        name: [rules.required('Name'), rules.minLength(2, 'Name'), rules.maxLength(100, 'Name')],
        gender: [rules.required('Gender'), rules.enum(['MALE', 'FEMALE', 'OTHER'], 'Gender')],
        contactNo: [rules.required('Contact number'), rules.phone()]
    },

    updatePassword: {
        currentPassword: [rules.required('Current password')],
        newPassword: [rules.required('New password'), rules.password()],
        confirmPassword: [rules.required('Confirm password')]
    },

    // Attendance schemas
    attendance: {
        classId: [rules.required('Class ID'), rules.positiveInt('Class ID')],
        sectionId: [rules.required('Section ID'), rules.positiveInt('Section ID')],
        date: [rules.required('Date'), rules.date()]
    },

    markDailyAttendance: {
        classId: [rules.required('Class ID'), rules.positiveInt('Class ID')],
        sectionId: [rules.required('Section ID'), rules.positiveInt('Section ID')],
        date: [rules.required('Date'), rules.date()],
        attendanceData: [rules.required('Attendance data'), rules.array('Attendance data'), rules.nonEmptyArray('Attendance data')]
    },

    monthlyAttendanceQuery: {
        month: [rules.required('Month'), rules.month()],
        year: [rules.required('Year'), rules.year()]
    },

    // Result schemas
    result: {
        studentId: [rules.required('Student ID'), rules.positiveInt('Student ID')],
        subjectId: [rules.required('Subject ID'), rules.positiveInt('Subject ID')],
        fullMarks: [rules.required('Full marks'), rules.number('Full marks'), rules.min(0, 'Full marks'), rules.max(1000, 'Full marks')],
        passMarks: [rules.required('Pass marks'), rules.number('Pass marks'), rules.min(0, 'Pass marks')],
        theoryMarks: [rules.number('Theory marks'), rules.min(0, 'Theory marks')],
        practicalMarks: [rules.number('Practical marks'), rules.min(0, 'Practical marks')]
    },

    // Leave schemas
    createLeave: {
        leaveTypeId: [rules.required('Leave type'), rules.positiveInt('Leave type ID')],
        subject: [rules.required('Subject'), rules.minLength(3, 'Subject'), rules.maxLength(200, 'Subject')],
        fromDate: [rules.required('From date'), rules.date('From date')],
        toDate: [rules.required('To date'), rules.date('To date')],
        description: [rules.required('Description'), rules.minLength(10, 'Description'), rules.maxLength(1000, 'Description')]
    },

    updateLeaveStatus: {
        status: [rules.required('Status'), rules.enum(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], 'Status')],
        remarks: [rules.maxLength(500, 'Remarks')]
    },

    // Announcement schemas
    createAnnouncement: {
        title: [rules.required('Title'), rules.minLength(5, 'Title'), rules.maxLength(200, 'Title')],
        content: [rules.required('Content'), rules.minLength(10, 'Content'), rules.maxLength(5000, 'Content')],
        priority: [rules.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'], 'Priority')],
        targetAudience: [rules.enum(['ALL', 'STUDENTS', 'TEACHERS', 'PARENTS', 'SPECIFIC'], 'Target audience')]
    },

    // Holiday schemas
    createHoliday: {
        name: [rules.required('Name'), rules.minLength(2, 'Name'), rules.maxLength(100, 'Name')],
        fromDate: [rules.required('From date'), rules.date('From date')],
        toDate: [rules.required('To date'), rules.date('To date')],
        holidayTypeId: [rules.required('Holiday type'), rules.positiveInt('Holiday type ID')]
    },

    holidayQuery: {
        year: [rules.year()],
        month: [rules.month()],
        holidayTypeId: [rules.positiveInt('Holiday type ID')]
    },

    // Timetable schemas
    createTimetable: {
        classId: [rules.required('Class ID'), rules.positiveInt('Class ID')],
        sectionId: [rules.required('Section ID'), rules.positiveInt('Section ID')],
        academicYear: [rules.required('Academic year'), rules.academicYear()],
        term: [rules.required('Term'), rules.minLength(2, 'Term')]
    },

    addPeriod: {
        timetableId: [rules.required('Timetable ID'), rules.positiveInt('Timetable ID')],
        timeSlotId: [rules.required('Time slot ID'), rules.positiveInt('Time slot ID')],
        subjectId: [rules.required('Subject ID'), rules.positiveInt('Subject ID')],
        teacherId: [rules.required('Teacher ID'), rules.positiveInt('Teacher ID')],
        dayOfWeek: [rules.required('Day of week'), rules.dayOfWeek()]
    },

    createTimeSlot: {
        startTime: [rules.required('Start time'), rules.time('Start time')],
        endTime: [rules.required('End time'), rules.time('End time')],
        isBreak: [rules.boolean('Is break')]
    },

    // Achievement schemas
    createAchievement: {
        activityType: [rules.required('Activity type'), rules.minLength(2, 'Activity type')],
        title: [rules.required('Title'), rules.minLength(5, 'Title'), rules.maxLength(200, 'Title')],
        organization: [rules.required('Organization'), rules.minLength(2, 'Organization')],
        fromDate: [rules.required('From date'), rules.date('From date')],
        toDate: [rules.required('To date'), rules.date('To date')],
        description: [rules.required('Description'), rules.minLength(10, 'Description')],
        achievementTypeId: [rules.required('Achievement type'), rules.positiveInt('Achievement type ID')]
    },

    // Report schemas
    reportQuery: {
        month: [rules.month()],
        year: [rules.year()],
        classId: [rules.positiveInt('Class ID')],
        sectionId: [rules.positiveInt('Section ID')]
    },

    // Class/Section schemas
    createClass: {
        name: [rules.required('Class name'), rules.minLength(1, 'Class name'), rules.maxLength(50, 'Class name')]
    },

    createSection: {
        name: [rules.required('Section name'), rules.minLength(1, 'Section name'), rules.maxLength(50, 'Section name')],
        classId: [rules.required('Class ID'), rules.positiveInt('Class ID')]
    },

    // Subject schemas
    createSubject: {
        name: [rules.required('Subject name'), rules.minLength(2, 'Subject name'), rules.maxLength(100, 'Subject name')],
        code: [rules.required('Subject code'), rules.minLength(2, 'Subject code'), rules.maxLength(20, 'Subject code')]
    },

    // Feedback schemas
    createFeedback: {
        feedbackType: [rules.required('Feedback type'), rules.minLength(2, 'Feedback type'), rules.maxLength(50, 'Feedback type')],
        subject: [rules.required('Subject'), rules.minLength(3, 'Subject'), rules.maxLength(200, 'Subject')],
        description: [rules.required('Description'), rules.minLength(10, 'Description'), rules.maxLength(2000, 'Description')]
    },

    // ID param schemas
    idParam: {
        id: [rules.required('ID'), rules.positiveInt('ID')]
    },

    classIdParam: {
        classId: [rules.required('Class ID'), rules.positiveInt('Class ID')]
    },

    // Query schemas
    paginationQuery: {
        page: [rules.positiveInt('Page')],
        limit: [rules.positiveInt('Limit'), rules.max(100, 'Limit')]
    }
};

/**
 * Validate ID parameter middleware
 */
export const validateId = validate(schemas.idParam, 'params');

/**
 * Validate pagination query parameters
 */
export const validatePagination = (req, res, next) => {
    const { page, limit } = req.query;

    if (page !== undefined) {
        const pageNum = Number(page);
        if (isNaN(pageNum) || pageNum < 1) {
            return next(new ApiError(400, 'Page must be a positive integer'));
        }
        req.query.page = pageNum;
    }

    if (limit !== undefined) {
        const limitNum = Number(limit);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            return next(new ApiError(400, 'Limit must be between 1 and 100'));
        }
        req.query.limit = limitNum;
    }

    next();
};
