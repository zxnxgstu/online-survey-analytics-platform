const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../config/authConfig');


exports.register = async (req, res) => {
    const { username, email, password, role } = req.body;

    try {
        const existingUserByUsername = await User.findByUsername(username);
        if (existingUserByUsername) {
            return res.status(400).json({ message: 'Користувач із таким ім’ям уже існує' });
        }

        const existingUserByEmail = await User.findByEmail(email);
        if (existingUserByEmail) {
            return res.status(400).json({ message: 'Користувач із таким email уже існує' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await User.create(username, email, hashedPassword, role);
        const userId = result.insertId;

        const token = generateToken({ id: userId, username, role: role || 'user' });

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка реєстрації', error: err.message });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(400).json({ message: 'Користувача не знайдено' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Недійсні облікові дані' });
        }

        const token = generateToken(user);

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Помилка входу', error: err.message });
    }
};
