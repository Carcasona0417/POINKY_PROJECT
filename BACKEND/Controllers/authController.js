import bcrypt from 'bcrypt';
import { createUser, getUserByCredentials, SendOTPEmail, updateUserPassword, updateUserProfile, getUserById, getUserByIdWithPassword, updateUserPasswordById } from '../Logic/Login-register.js';

let otpStore = {};

export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const users = await getUserByCredentials(email);

        if (!users || users.length === 0) {
            return res.status(401).send({ success: false, message: 'Invalid email or password.' });
        }

        const user = users[0];

        const passwordMatch = await bcrypt.compare(password, user.Password);
        
        if (!passwordMatch) {
            return res.status(401).send({ success: false, message: 'Invalid email or password.' });
        }

        return res.send({
            success: true,
            message: `Login successful! Welcome ${user.Username}.`,
            user: {
                UserID: user.UserID,
                Username: user.Username,
                Email: user.Email
            }
        });
    } catch (err) {
        next(err);
    }
};

export const registerUser = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const passwordHash = await bcrypt.hash(password, 10);
        const result = await createUser(null, username, email, passwordHash);
       
        return res.send({
            success: true,
            message: 'Registration successful!',
            userId: result.insertId
        });
    } catch (err) {
        next(err);
    }
};

export const verifyEmail = async (req, res, next) => {
    try {
        const { email } = req.body;

        const users = await getUserByCredentials(email);

        if (!users || users.length === 0) {
            return res.status(401).send({
                success: false,
                message: "Email not found."
            });
        }

        return res.send({
            success: true,
            message: "Email verified."
        });

    } catch (err) {
        next(err);
    }
};

export const sendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;
        const otp = await SendOTPEmail(email);

        otpStore[email] = {
            otp: otp,
            expiresAt: Date.now() + (10 * 60 * 1000) // 5 minutes
        };

        res.send({ success: true, message: "OTP has been sent." });

    } catch (err) {
        next(err);
    }
};

export const confirmOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;

        const entry = otpStore[email];

        // NO OTP FOUND
        if (!entry) {
            return res.status(400).send({
                success: false,
                message: "No OTP found or OTP expired"
            });
        }

        // OTP EXPIRES
        if (Date.now() > entry.expiresAt) {
            delete otpStore[email];
            return res.status(400).send({
                success: false,
                message: "OTP has expired. Please request another!"
            });
        }

        // OTP INCORRECT
        if (entry.otp.toString() !== otp.toString()) {
            return res.status(400).send({
                success: false,
                message: "Incorrect OTP"
            });
        }

        // OTP IS CORRECT
        delete otpStore[email];
        return res.send({
            success: true,
            message: "OTP verified successfully!"
        });

    } catch (err) {
        next(err);
    }
};
export const updatePassword = async (req, res, next) => {

    try {
        const { email, newPassword } = req.body;
        
        if (!email || !newPassword) {
            return res.status(400).send({ success: false, message: 'Email and newPassword are required' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await updateUserPassword(email, hashedPassword);
        return res.send({ success: true, message: 'Password Successfully Updated!' });
    }
    catch (err) {
        next(err);
    }
}

export const updatePasswordByUID = async (req, res, next) => {
    try {
        // Expecting: { userId, oldPassword, newPassword }
        const { userId, oldPassword, newPassword } = req.body;

        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).send({ success: false, message: 'userId, oldPassword and newPassword are required' });
        }

        const user = await getUserByIdWithPassword(userId);
        if (!user) return res.status(404).send({ success: false, message: 'User not found' });

        const match = await bcrypt.compare(oldPassword, user.Password);
        if (!match) return res.status(401).send({ success: false, message: 'Old password is incorrect' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await updateUserPasswordById(userId, hashedPassword);

        return res.send({ success: true, message: 'Password Successfully Updated!' });
    } catch (err) {
        next(err);
    }
};

// Update user profile (username/email)
export const updateProfile = async (req, res, next) => {
    try {
        const { userId, username, email } = req.body;

        if (!userId) {
            return res.status(400).send({ success: false, message: 'UserID is required' });
        }
        if (!username || !email) {
            return res.status(400).send({ success: false, message: 'Username and email are required' });
        }

        await updateUserProfile(userId, username, email);

        return res.send({ success: true, message: 'Profile updated successfully' });
    } catch (err) {
        if (err.message && err.message.includes('Email already in use')) {
            return res.status(409).send({ success: false, message: err.message });
        }
        next(err);
    }
};

// Get profile by userId
export const getProfile = async (req, res, next) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).send({ success: false, message: 'userId required' });
        const user = await getUserById(userId);
        if (!user) return res.status(404).send({ success: false, message: 'User not found' });
        return res.send({ success: true, user });
    } catch (err) {
        next(err);
    }
};
