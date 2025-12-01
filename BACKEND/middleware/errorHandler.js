// Global error handling middleware
export const errorHandler = (error, req, res, next) => {
    console.error('ERROR HANDLER TRIGGERED:');
    console.error(error && error.stack ? error.stack : error);
    
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Something broke!';
    
    res.status(statusCode).json({
        success: false,
        message: message,
        error: process.env.NODE_ENV === 'development' ? error : {}
    });
};

export default errorHandler;
