import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';

import {createUser, getUserByCredentials} from './Login-register.js';
import { getTotalFarms,getTotalPigs,getUpcomingReminders, getMonthExpenses, getChartData } from './Dashboard.js';

const app = express();


app.use(cors());
app.use(express.json());

// LOGIN POST REQUEST
app.post('/login', async (req, res, next) => {
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
            user: user
        });
    } catch (err) {
        next(err);
    }
});

// REGISTER POST REQUEST
app.post('/register', async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const passwordHash = await bcrypt.hash(password, 10);
        const result = await createUser(null, username, email, passwordHash);

        //const result = await createUser(null, username, email, password); -- RISKY INTEGRATION --
       
        return res.send({
            success: true,
            message: 'Registration successful!',
            userId: result.insertId
        });
    } catch (err) {
        next(err);
    }
});

// OTP sending
app.get("/send-otp", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "oskarjene08@gmail.com",
        pass: "dtez egni aqnt qaub"
      }
    });

    const otp = Math.floor(100000 + Math.random() * 900000);

    await transporter.sendMail({
      to: "ojcarcasona8@gmail.com",
      subject: "Notification",
      html: `<p>Your OTP is: <b>${otp}</b></p>`
    });

    res.send({ success: true, otp });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending email");
  }
});


// TOTAL FARMS ROUTE
app.post('/total-farms', async (req, res, next) => {
    try {
        const rows = await getTotalFarms();
        return res.send({ totalFarms: rows[0].totalFarms });
    } catch (err) {
        next(err);
    }
});

// TOTAL PIGS ROUTE
app.post('/total-pigs', async (req, res, next) => {
    try {
        const rows = await getTotalPigs();
        res.send({ totalPigs: rows[0].totalPigs });
    } catch (err) {
        next(err);
    }
});

// TOTAL EXPENSES THIS MONTH
app.post('/month-expenses', async (req, res, next) => {
    try {
        const rows = await getMonthExpenses();
        res.send({ monthExpenses: rows[0].monthExpenses });
    } catch (err) {
        next(err);
    }
});

// TOTAL UPCOMING REMINDERS ROUTE
app.post('/upcoming-reminders', async (req, res, next) => {
    try {
        const rows = await getUpcomingReminders();
        res.send({ upcomingReminders: rows[0].upcomingReminders });
    } catch (err) {
        next(err);
    }
});
        
// MONTHLY EXPENSES FOR BAR CHART
app.post('/getChartData', async (req, res, next) => {
    try {
        const rows = await getChartData();
        res.send({ chartData: rows});

    } catch (err) {
        next(err);
    }

});


app.use((error, req, res, next) => {
    console.error(error && error.stack ? error.stack : error);
    res.status(500).send('Something broke!');
});


app.listen(8080, () => {
    console.log('Server is running on port 8080');
});
