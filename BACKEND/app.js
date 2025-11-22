import express from 'express';
import cors from 'cors';

import {createUser, getUserByCredentials} from './Login-register.js';

const app = express();

app.use(cors());
app.use(express.json());

app.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const users = await getUserByCredentials(email, password);

        if (!users || users.length === 0) {
            return res.status(401).send({ success: false, message: 'Invalid email or password.' });
        }

        const user = users[0];
        return res.send({
            success: true,
            message: `Login successful! Welcome ${user.Username}.`,
            user: user
        });
    } catch (err) {
        next(err);
    }
});

app.post('/register', async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const result = await createUser(null, username, email, password);
        return res.send({
            success: true,
            message: 'Registration successful!',
            userId: result.insertId
        });
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
