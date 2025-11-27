import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';


import {createUser, getUserByCredentials, SendOTPEmail, updateUserPassword} from './Login-register.js';
import { getTotalFarms,getTotalPigs,getUpcomingReminders, getMonthExpenses, getChartData, getPieChart } from './Dashboard.js';

const app = express();
let otpStore = {};


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
            user: {
                UserID: user.UserID,
            }
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

// Verifying Email
app.post('/verifyEmail', async (req, res, next) => {
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
});

// OTP sending
app.post("/send-otp", async (req, res,next) => {

  try {
    const { email } = req.body;
    const otp = await SendOTPEmail(email);

    otpStore[email] = {
      otp: otp,
      expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
    };

    res.send({success: true, message: "OTP has been sent."})

  } catch (err) {
    next(err);
  }
});

// Confrim OTP
app.post("/confirm-OTP", async (req, res, next) => {

    try{
        const {email,otp} = req.body;

        const entry = otpStore[email]

        // NO OTP FOUND
        if (!entry){
            return res.status(400).send({
                success: false,
                message: "No OTP found or OTP expired"
            })
        }

        // OTP EXPIRES
        if (Date.now() > entry.expireAt){
            delete otpStore[email];
            return res.status(400).send({
                success: false,
                message: "OTP has expired. Please request another!"
            })
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
        })
        

    } catch (err){
        next(err);
    }
})


// UPDATING PASSOWRD
app.post('/Update-Password', async (req, res, next) => {
    try {
        const { email, newPassword } = req.body;

        // IF THE TEXTBOXES ARE EMPTY
        if(!email || !newPassword) {
            return res.status(400).send({
                succes: false,
                message: "Email and new Password is required"
            })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10)

        await updateUserPassword(email,hashedPassword)

        return res.send({
            success: true,
            message: "Password Succesfully Updated!"
        });
        
    } catch (err) {
        next (err);
    }
}); 


// TOTAL FARMS ROUTE
app.post('/total-farms', async (req, res, next) => {

    try{

        const { userId } = req.body;
        const rows = await getTotalFarms(userId);
        res.json({ totalFarms: rows[0].totalFarms });

    } catch (err){
        next(err)
    }

});

// TOTAL PIGS ROUTE
app.post('/total-pigs', async (req, res, next) => {

    try {

        const { userId } = req.body;
        const rows = await getTotalPigs(userId);
        res.send({ totalPigs: rows[0].totalPigs });

    } catch (err) {
        next(err);
    }
});

// TOTAL EXPENSES THIS MONTH
app.post('/month-expenses', async (req, res, next) => {

    try {
        const { userId } = req.body
        const rows = await getMonthExpenses(userId);
        res.send({ monthExpenses: rows[0].monthExpenses });
    } catch (err) {
        next(err);
    }
});

// TOTAL UPCOMING REMINDERS ROUTE
app.post('/upcoming-reminders', async (req, res, next) => {

    try {

        const { userId } = req.body
        const rows = await getUpcomingReminders(userId);
        res.send({ upcomingReminders: rows[0].upcomingReminders });

    } catch (err) {
        next(err);
    }
});
        
// MONTHLY INCOME AND farm EXPENSES FOR BAR CHART
app.post('/getChartData', async (req, res, next) => {

    try {
        const { userId } = req.body
        const rows = await getChartData(userId);
        res.send({ chartData: rows});

    } catch (err) {
        next(err);
    }

});

// MONTHLY BREAKDOWN OF ALL EXPENSES FOR PIE CHART
app.post('/getPieChart', async (req, res, next) => {

    try{
        
        const { userId } = req.body
        const rows = await getPieChart(userId);
        res.send({
            feed: rows.feed,
            piglets: rows.piglets,
            medical: rows.medical,
            utilities: rows.utilities,
            labor: rows.labor,
            maintenance: rows.maintenance
        });

    } catch (err){

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
