// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Prisma errors
    if (err.code === 'P2002') {
        return res.status(400).json({ error: 'Duplicate entry. Resource already exists.' });
    }
    if (err.code === 'P2025') {
        return res.status(404).json({ error: 'Record not found.' });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: err.message });
    }

    // Default to 500 server error
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
};

// 404 Handler
const notFoundHandler = (req, res) => {
    res.status(404).json({ error: 'Route not found' });
};

module.exports = { errorHandler, notFoundHandler };
