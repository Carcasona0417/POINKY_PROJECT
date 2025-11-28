import bcrypt from 'bcrypt';
import { createUser, getUserByCredentials, SendOTPEmail, updateUserPassword } from '../IrrelevantFiles/Login-register.js';

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
            expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
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

        // IF THE TEXTBOXES ARE EMPTY
        if (!email || !newPassword) {
            return res.status(400).send({
                success: false,
                message: "Email and new Password is required"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await updateUserPassword(email, hashedPassword);

        return res.send({
            success: true,
            message: "Password Successfully Updated!"
        });
        
    } catch (err) {
        next(err);
    }
};
