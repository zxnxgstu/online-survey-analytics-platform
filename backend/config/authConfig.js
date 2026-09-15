const jwt = require('jsonwebtoken');
const User = require('../models/User');

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
}

const generateToken = (user) => jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '4h' }
);

const verifyToken = async (req, res, next) => {
    const authHeader = req.header('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
        return res.status(401).json({ message: 'Токен відсутній' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.getUserById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Такого користувача не існує' });
        }

        req.user = { id: user.id, username: user.username, role: user.role };

        if (user.role !== decoded.role || user.username !== decoded.username) {
            const newToken = generateToken(user);
            res.setHeader('Access-Control-Expose-Headers', 'X-New-Token');
            res.setHeader('X-New-Token', newToken);
        }

        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Недійсний або прострочений токен' });
    }
};

const verifyAdvancedUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (!['advanced', 'admin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Недостатньо прав' });
        }
        return next();
    });
};

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Недостатньо прав' });
        }
        return next();
    });
};

module.exports = { generateToken, verifyToken, verifyAdvancedUser, verifyAdmin };
