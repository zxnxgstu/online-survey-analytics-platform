const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Маршрут для реєстрації користувача
router.post('/register', authController.register);

// Маршрут для авторизації користувача
router.post('/login', authController.login);

module.exports = router;
