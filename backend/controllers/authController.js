const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../config/authConfig');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.register = async (req, res) => {
    const username = String(req.body.username || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    try {
        if (username.length < 3 || username.length > 50) {
            return res.status(400).json({ message: 'Ім’я користувача має містити від 3 до 50 символів' });
        }
        if (!EMAIL_RE.test(email)) {
            return res.status(400).json({ message: 'Некоректний email' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Пароль має містити щонайменше 6 символів' });
        }

        if (await User.findByUsername(username)) {
            return res.status(400).json({ message: 'Користувач із таким ім’ям уже існує' });
        }
        if (await User.findByEmail(email)) {
            return res.status(400).json({ message: 'Користувач із таким email уже існує' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await User.create(username, email, hashedPassword);
        const token = generateToken({ id: result.insertId, username, role: 'user' });

        return res.status(201).json({ token });
    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ message: 'Помилка реєстрації' });
    }
};

exports.login = async (req, res) => {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');

    try {
        if (!username || !password) {
            return res.status(400).json({ message: 'Введіть ім’я користувача та пароль' });
        }

        const user = await User.findByUsername(username);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Недійсні облікові дані' });
        }

        return res.json({ token: generateToken(user) });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: 'Помилка входу' });
    }
};
