require('dotenv').config();

const helmet = require('helmet');
const cors = require('cors');
const rateLimiter = require('express-rate-limit');

const express = require('express');
const path = require('path');
const app = express();

const connectDB = require('./db/connect');
const authRouter = require('./routes/authRoute');
const urlRouter = require('./routes/urlRoute');

require('./cron/deleteInactiveURL');

const notFound = require('./middleware/notFoundMiddleware');
const errorHandler = require('./middleware/errorHandlerMiddleware');

// Security
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS — allow any local origin for development
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:5500', 'http://127.0.0.1:3000', 'null'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Rate limiting
app.use(
    rateLimiter({
        windowMs: 15 * 60 * 1000,
        max: 100,
        message: 'Too many requests from this IP'
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/auth', authRouter);
app.use('/shorten', urlRouter);

// Serve frontend for any non-API route (SPA fallback)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.log(error);
    }
};

start();
