import { UserService } from '../services/userService.js';
import { AppError } from '../middlewares/errorHandler.js';

const userService = new UserService();

export const getProfile = async (req, res, next) => {
    try {
        const user = await userService.getUserProfile(req.user.id);
        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const updatedUser = await userService.updateProfile(req.user.id, req.body);
        res.status(200).json({
            status: 'success',
            data: { user: updatedUser }
        });
    } catch (error) {
        next(error);
    }
};

export const updatePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            return next(new AppError(400, 'New passwords do not match'));
        }

        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return next(new AppError(400, 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'));
        }

        await userService.updatePassword(req.user.id, currentPassword, newPassword);

        res.status(200).json({
            status: 'success',
            message: 'Password updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfilePicture = async (req, res, next) => {
    try {
        if (!req.file) {
            return next(new AppError(400, 'Please upload a file'));
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(req.file.mimetype)) {
            return next(new AppError(400, 'Please upload an image file (jpeg, jpg, or png)'));
        }

        // In a real application, you would upload the file to a cloud storage
        // and get back the URL. For now, we'll use a dummy URL
        const fileUrl = `https://storage.example.com/profiles/${req.file.filename}`;

        const profilePicture = await userService.updateProfilePicture(req.user.id, fileUrl);

        res.status(200).json({
            status: 'success',
            data: { profilePicture }
        });
    } catch (error) {
        next(error);
    }
}; 