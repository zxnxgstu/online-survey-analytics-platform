const User = require('../models/User');
const { generateToken } = require('../config/authConfig');
const bcrypt = require('bcryptjs');

const VALID_ROLES = new Set(['user', 'advanced', 'admin']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.updateUserProfile = async (req, res) => {
    const { userId, role } = req.body;
    const currentUserId = Number(req.user.id);
    const currentUserRole = req.user.role;
    const targetUserId = currentUserRole === 'admin' && userId ? Number(userId) : currentUserId;

    try {
        const current = await User.getUserById(targetUserId);
        if (!current) return res.status(404).json({ message: 'Користувача не знайдено' });

        const username = String(req.body.username ?? current.username).trim();
        const email = String(req.body.email ?? current.email).trim().toLowerCase();
        const password = req.body.password ? String(req.body.password) : '';

        if (username.length < 3 || username.length > 50) {
            return res.status(400).json({ message: 'Ім’я користувача має містити від 3 до 50 символів' });
        }
        if (!EMAIL_RE.test(email)) {
            return res.status(400).json({ message: 'Некоректний email' });
        }
        if (password && password.length < 6) {
            return res.status(400).json({ message: 'Пароль має містити щонайменше 6 символів' });
        }

        const byEmail = await User.findByEmail(email);
        const byUsername = await User.findByUsername(username);
        if (byEmail && Number(byEmail.id) !== targetUserId) {
            return res.status(400).json({ message: 'Email вже використовується іншим користувачем' });
        }
        if (byUsername && Number(byUsername.id) !== targetUserId) {
            return res.status(400).json({ message: 'Логін вже використовується іншим користувачем' });
        }

        let hashedPassword;
        if (password) hashedPassword = await bcrypt.hash(password, 10);

        let targetRole;
        if (currentUserRole === 'admin' && role !== undefined) {
            if (!VALID_ROLES.has(role)) return res.status(400).json({ message: 'Недійсна роль користувача' });
            targetRole = role;
        }

        const updatedUser = await User.updateProfile(targetUserId, username, email, hashedPassword, targetRole);
        const response = { message: 'Профіль оновлено успішно', user: updatedUser };
        if (targetUserId === currentUserId) response.token = generateToken(updatedUser);
        return res.json(response);
    } catch (err) {
        console.error('Profile update error:', err);
        return res.status(500).json({ message: 'Помилка оновлення профілю' });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.getUserById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Користувача не знайдено' });
        return res.json(user);
    } catch (err) {
        return res.status(500).json({ message: 'Помилка отримання профілю користувача' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        return res.json(await User.getAllUsers());
    } catch (err) {
        return res.status(500).json({ message: 'Помилка отримання користувачів' });
    }
};

exports.deleteUser = async (req, res) => {
    const targetUserId = Number(req.params.userId);
    try {
        if (!Number.isInteger(targetUserId)) return res.status(400).json({ message: 'Некоректний ID користувача' });
        if (targetUserId !== Number(req.user.id) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Ви не можете видалити іншого користувача' });
        }
        const target = await User.getUserById(targetUserId);
        if (!target) return res.status(404).json({ message: 'Користувача не знайдено' });
        await User.deleteUser(targetUserId);
        return res.json({ message: 'Користувача успішно видалено разом з усіма його даними.' });
    } catch (err) {
        return res.status(500).json({ message: 'Помилка видалення користувача', error: err.message });
    }
};

exports.createRequestPrivilege = async (req, res) => {
    try {
        if (req.user.role !== 'user') {
            return res.status(400).json({ message: 'Ваш акаунт уже має розширені права' });
        }
        const last = await User.getLastRequestByUserId(req.user.id);
        if (last?.status === 'pending') {
            return res.status(409).json({ message: 'У вас вже є заявка на розгляді' });
        }
        await User.createPrivilegeRequest(req.user.id, String(req.body.comment || '').trim());
        return res.status(201).json({ message: 'Заявка успішно подана' });
    } catch (err) {
        return res.status(500).json({ message: 'Помилка подання заявки' });
    }
};

exports.getLastRequestByUserId = async (req, res) => {
    try {
        return res.json((await User.getLastRequestByUserId(req.user.id)) || null);
    } catch (err) {
        return res.status(500).json({ message: 'Помилка отримання статусу заявки' });
    }
};

exports.getRequests = async (req, res) => {
    try {
        return res.json(await User.getAllPendingPrivilegeRequests());
    } catch (err) {
        return res.status(500).json({ message: 'Помилка отримання заявок' });
    }
};

exports.rejectRequestPrivilege = async (req, res) => {
    try {
        const request = await User.getPrivilegeRequestById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Заявку не знайдено' });
        if (request.status !== 'pending') return res.status(409).json({ message: 'Заявку вже оброблено' });
        await User.rejectPrivilegeRequest(req.params.id, req.user.id, String(req.body.comment || '').trim());
        return res.json({ message: 'Заявка відхилена' });
    } catch (err) {
        return res.status(500).json({ message: 'Помилка відхилення заявки' });
    }
};

exports.approveRequestPrivilege = async (req, res) => {
    try {
        const request = await User.getPrivilegeRequestById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Заявку не знайдено' });
        if (request.status !== 'pending') return res.status(409).json({ message: 'Заявку вже оброблено' });
        await User.approvePrivilegeRequest(req.params.id, req.user.id);
        await User.setRole(request.user_id, 'advanced');
        return res.json({ message: 'Заявка схвалена' });
    } catch (err) {
        return res.status(500).json({ message: 'Помилка схвалення заявки' });
    }
};
