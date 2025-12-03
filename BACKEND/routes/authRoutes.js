import express from 'express';
import {
    loginUser,
    registerUser,
    verifyEmail,
    sendOTP,
    confirmOTP,
    updatePassword
    , updateProfile,
    getProfile
} from '../Controllers/authController.js';

const router = express.Router();

// Authentication routes
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/send-otp', sendOTP);
router.post('/confirm-otp', confirmOTP);
router.post('/update-password', updatePassword);
router.post('/update-profile', updateProfile);
router.post('/get-profile', getProfile);

export default router;
