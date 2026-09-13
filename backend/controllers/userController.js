const User = require('../models/User');
const { generateToken } = require('../config/authConfig');
const bcrypt = require('bcryptjs');
const {db} = require("../config/dbConfig");

exports.updateUserProfile = async (req, res) => {
    const { username, email, password, userId } = req.body;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    // Визначаємо ID користувача, якого редагуємо
    const targetUserId = (currentUserRole === 'admin' && userId) ? userId : currentUserId;

    try {
        // Перевірка на наявність користувача з таким email або username
        const existingUserByEmail = await User.findByEmail(email);
        const existingUserByUsername = await User.findByUsername(username);

        if (existingUserByEmail && existingUserByEmail.id !== targetUserId) {
            return res.status(400).json({ message: 'Email вже використовується іншим користувачем' });
        }

        if (existingUserByUsername && existingUserByUsername.id !== targetUserId) {
            return res.status(400).json({ message: 'Логін вже використовується іншим користувачем' });
        }

        if(!username || !email){
            return res.status(400).json({ message: 'Логін та Email обов\'язкові для заповнення' });
        }

        let hashedPassword = undefined;
        // Якщо пароль був переданий, хешуємо його
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        // Оновлюємо профіль користувача
        const updatedUser = await User.updateProfile(targetUserId, username, email, hashedPassword);
        const user = await User.getUserById(targetUserId);  // Отримуємо оновлені дані користувача з БД

        // Генерація нового токена з оновленими даними
        const token = generateToken({ id: user.id, username: user.username, role: user.role || 'user' });
        // Повертаємо оновленого користувача
        res.json({ message: 'Профіль оновлено успішно', user: updatedUser, token });
    } catch (err) {
        res.status(500).json({ message: 'Помилка оновлення профіля', error: err.message });
    }
};

exports.getUserProfile = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.getUserById(userId);
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Помилка отримання профілю користувача', error: err });
    }
};

exports.getAllUsers = async (req, res) => {

    try {
        const users = await User.getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Помилка отримання профілю користувача', error: err });
    }
};

exports.deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
        if(userId !== req.user.id) {
            if(req.user.role !== "admin") return res.status(403).json({ message: 'Ви не можете видалити іншого користувача'});
        }

        await User.deleteUser(userId);

        res.status(200).json({ message: 'Користувача успішно видалено разом з усіма його даними.' });
    } catch (err) {
        res.status(500).json({ message: 'Помилка видалення користувача', error: err.message });
    }
};

exports.createRequestPrivilege = async (req, res) => {
    try {
        const { comment } = req.body;
        await User.createPrivilegeRequest(req.user.id, comment);
        res.json({ message: 'Заявка успішно подана' });
    } catch (err) {
        res.status(500).json({ message: 'Помилка подання заявки' });
    }
};

exports.getLastRequestByUserId = async (req, res) => {
    try {
        const request = await User.getLastRequestByUserId(req.user.id);
        res.json(request || null);
    } catch (err) {
        res.status(500).json({ message: 'Помилка отримання статусу заявки' });
    }
}

exports.getRequests = async (req, res) => {
    try {
        const requests = await User.getAllPendingPrivilegeRequests();
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: 'Помилка отримання заявок' });
    }
}

exports.rejectRequestPrivilege = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;
        await User.rejectPrivilegeRequest(id, req.user.id, comment);
        res.json({ message: 'Заявка відхилена' });
    } catch (err) {
        res.status(500).json({ message: 'Помилка відхилення заявки' });
    }
};

exports.approveRequestPrivilege = async (req, res) => {
    try {
        const { id } = req.params;
        await User.approvePrivilegeRequest(id, req.user.id);

        const request = await User.getPrivilegeRequestById(id);
        await User.updateProfile(request[0].user_id, null, null, null,"advanced");

        res.json({ message: 'Заявка схвалена' });
    } catch (err) {
        res.status(500).json({ message: 'Помилка схвалення заявки' });
    }
};