const { db } = require('../config/dbConfig');

const promiseQuery = (sql, params = []) => db.promise().query(sql, params).then(([rows]) => rows);

const User = {
    create: async (username, email, password) => {
        const [result] = await db.promise().query(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [username, email, password, 'user']
        );
        return result;
    },

    findByUsername: async (username) => {
        const rows = await promiseQuery('SELECT * FROM users WHERE username = ? LIMIT 1', [username]);
        return rows[0];
    },

    findByEmail: async (email) => {
        const rows = await promiseQuery('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
        return rows[0];
    },

    updateProfile: async (userId, username, email, password, role) => {
        const sets = [];
        const params = [];

        if (username !== undefined && username !== null) {
            sets.push('username = ?');
            params.push(username);
        }
        if (email !== undefined && email !== null) {
            sets.push('email = ?');
            params.push(email);
        }
        if (password) {
            sets.push('password = ?');
            params.push(password);
        }
        if (role) {
            sets.push('role = ?');
            params.push(role);
        }

        if (sets.length > 0) {
            params.push(userId);
            await db.promise().query(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, params);
        }

        return User.getUserById(userId);
    },

    setRole: async (userId, role) => {
        await db.promise().query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
        return User.getUserById(userId);
    },

    getUserById: async (userId) => {
        const rows = await promiseQuery(
            'SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
            [userId]
        );
        return rows[0];
    },

    getAllUsers: () => promiseQuery(
        'SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    ),

    deleteUser: async (userId) => {
        const [result] = await db.promise().query('DELETE FROM users WHERE id = ?', [userId]);
        return result;
    },

    getLastRequestByUserId: async (userId) => {
        const rows = await promiseQuery(
            'SELECT * FROM role_upgrade_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
            [userId]
        );
        return rows[0];
    },

    createPrivilegeRequest: async (userId, comment) => {
        const [result] = await db.promise().query(
            'INSERT INTO role_upgrade_requests (user_id, user_comment) VALUES (?, ?)',
            [userId, comment || null]
        );
        return result;
    },

    getAllPendingPrivilegeRequests: () => promiseQuery(`
        SELECT r.*, u.username AS user_username
        FROM role_upgrade_requests r
        JOIN users u ON r.user_id = u.id
        WHERE r.status = 'pending'
        ORDER BY r.created_at ASC
    `),

    approvePrivilegeRequest: async (requestId, adminId) => {
        const [result] = await db.promise().query(
            "UPDATE role_upgrade_requests SET status = 'approved', admin_id = ? WHERE id = ? AND status = 'pending'",
            [adminId, requestId]
        );
        return result;
    },

    rejectPrivilegeRequest: async (requestId, adminId, comment) => {
        const [result] = await db.promise().query(
            "UPDATE role_upgrade_requests SET status = 'rejected', admin_id = ?, admin_comment = ? WHERE id = ? AND status = 'pending'",
            [adminId, comment || null, requestId]
        );
        return result;
    },

    getPrivilegeRequestById: async (requestId) => {
        const rows = await promiseQuery('SELECT * FROM role_upgrade_requests WHERE id = ? LIMIT 1', [requestId]);
        return rows[0];
    },
};

module.exports = User;
