import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import pigRoutes from './routes/pigRoutes.js';
import farmRoutes from './routes/farmRoutes.js';
import expincRoutes from './routes/expincRoutes.js';
import remRoutes from './routes/remRoutes.js';
import notifRoutes from './routes/notifRoutes.js';


import errorHandler from './middleware/errorHandler.js';


const app = express();

// Middleware
app.use(cors());
// Accept larger JSON bodies because frontend may (mistakenly) send images as data URLs.
// We still avoid storing large data in the DB, but increasing the parser limit prevents
// "request entity too large" errors from aborting useful requests.
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pigs', pigRoutes);
app.use('/api/farm', farmRoutes);
app.use('/api/expenses-records', expincRoutes);
app.use('/api/reminders', remRoutes);
app.use('/api/notifications', notifRoutes);

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(8080, () => {
    console.log('Server is running on port 8080');
});
