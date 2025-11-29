import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import pigRoutes from './routes/pigRoutes.js';
import farmRoutes from './routes/farmRoutes.js';
import expincRoutes from './routes/expincRoutes.js';


import errorHandler from './middleware/errorHandler.js';


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pigs', pigRoutes);
app.use('/api/farm', farmRoutes);
app.use('/api/expenses-records', expincRoutes);

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
