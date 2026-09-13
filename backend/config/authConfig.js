const jwt = require('jsonwebtoken');
const User = require('../models/User');

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
}

exports.verifyToken = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if(!token) {
        return res.status(401).json({ message: 'Токен відсутній'});
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        let user = await User.getUserById(req.user.id);
        if(!user)
        {
            return res.status(401).json({ message: 'Такого користувача не існує'})
        }
        if (user.role !== decoded.role || user.username !== decoded.username) {
            const newToken = this.generateToken(user);
            res.setHeader('Access-Control-Expose-Headers', 'X-New-Token');
            res.set('X-New-Token', newToken);
            req.user = { id: user.id, username: user.username, role: user.role };
        }
        next()
    } catch (err){
        res.status(401).json({ message: 'Недійсний токен'})
    }
}

exports.verifyAdvancedUser = (req, res, next) => {
    this.verifyToken(req, res, () => {
        if (req.user.role !== 'advanced' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Недостатньо прав' });
        }
        next();
    });
};

exports.verifyAdmin = (req, res, next) => {
    this.verifyToken(req, res, () => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Недостатньо прав' });
        }
        next();
    });
};

exports.generateToken = (user) => {
    return jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '4h' });
};