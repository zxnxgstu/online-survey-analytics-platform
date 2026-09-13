require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Роутери
const authRoutes = require('./routes/authRoutes');
const pollRoutes = require('./routes/pollRoutes');
const userRoutes = require('./routes/userRoutes');
const databaseRoutes = require('./routes/databaseRoutes');
app.use('/auth', authRoutes);
app.use('/polls', pollRoutes);
app.use('/users', userRoutes);
app.use('/database', databaseRoutes);

// WebSockets для оновлення в реальному часі
const server = http.createServer(app);

// Запуск сервера
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}`);
});

// Експортуємо io для використання в контролерах
module.exports = { app, server };