import { authService } from '../services/authService.js';
import { ApiResponse } from '../utils/apiResponse.js';

const createSendToken = (user, statusCode, res) => {
    const token = authService.signToken(user.id);

    // Remove password from output
    user.password = undefined;

    res.cookie('jwt', token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    return res
        .status(statusCode)
        .json(
            new ApiResponse(
                statusCode,
                {
                    status: 'success',
                    token,
                    data: { user }
                }
            )
        );
};

export const register = async (req, res, next) => {
    try {
        const user = await authService.register(req.body);
        createSendToken(user, 201, res);
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await authService.login(email, password);
        createSendToken(user, 200, res);
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        await authService.forgotPassword(email);

        return res
            .status(200)
            .json({
                status: 'success',
                message: 'Token sent to email'
            });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;
        
        // Validate password strength
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                status: 'error',
                message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
            });
        }
        
        const user = await authService.resetPassword(token, newPassword);

        
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    status: 'success',
                    data: { user: { id: user.id, email: user.email } },
                    message: 'Password has been reset successfully'
                }
            )
        )
    } catch (error) {
        next(error);
    }
};

export const logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
};

export const refreshToken = async (req, res, next) => {
    try {
        // req.user is already set from the protect middleware
        createSendToken(req.user, 200, res);
    } catch (error) {
        next(error);
    }
}; 