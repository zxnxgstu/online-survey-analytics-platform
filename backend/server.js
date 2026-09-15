require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');

// Initialize database pool early so configuration errors are visible at startup.
require('./config/dbConfig');

const authRoutes = require('./routes/authRoutes');
const pollRoutes = require('./routes/pollRoutes');
const userRoutes = require('./routes/userRoutes');
const databaseRoutes = require('./routes/databaseRoutes');

const app = express();
const allowedOrigins = String(process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.disable('x-powered-by');
app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Origin is not allowed by CORS'));
    },
    exposedHeaders: ['X-New-Token'],
}));
app.use(express.json({ limit: '1mb' }));

if (process.env.NODE_ENV !== 'test') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });
}

app.get('/health', async (req, res) => {
    try {
        const { db } = require('./config/dbConfig');
        await db.promise().query('SELECT 1');
        return res.json({ status: 'ok', database: 'connected', message: 'Survey Analytics API is running' });
    } catch (err) {
        return res.status(503).json({ status: 'error', database: 'disconnected', message: 'Database connection failed' });
    }
});
app.use('/auth', authRoutes);
app.use('/polls', pollRoutes);
app.use('/users', userRoutes);
app.use('/database', databaseRoutes);

app.use((req, res) => res.status(404).json({ message: 'Маршрут не знайдено' }));
app.use((err, req, res, next) => {
    console.error(err);
    if (err?.message === 'Origin is not allowed by CORS') {
        return res.status(403).json({ message: 'CORS: origin is not allowed' });
    }
    return res.status(500).json({ message: 'Внутрішня помилка сервера' });
});

const server = http.createServer(app);
const PORT = Number(process.env.PORT || 5000);
if (require.main === module) {
    server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = { app, server };
