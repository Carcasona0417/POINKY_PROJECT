import express from 'express';
import {
    loginUser,
    registerUser,
    verifyEmail,
    sendOTP,
    confirmOTP,
    updatePassword
} from '../controllers/authController.js';

const router = express.Router();

// Authentication routes
router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/send-otp', sendOTP);
router.post('/confirm-otp', confirmOTP);
router.post('/update-password', updatePassword);

export default router;
