const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const resourcesRouter = require('./routes/resources');
const usersRouter = require('./routes/users');

app.use('/resources', resourcesRouter);
app.use('/users', usersRouter);


// Routes Placeholder
app.get('/', (req, res) => {

    res.send('Butter Barbies Backend is doing great!');
});

// Error Handling Middleware (must be last)
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

