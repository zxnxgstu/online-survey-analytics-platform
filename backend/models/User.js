const {db} = require('../config/dbConfig');

const User = {
    create: (username, email, password, role) => {
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', [username, email, password, role || 'user'], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    findByUsername: (username) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
                if (err) reject(err);
                resolve(results[0]);
            });
        });
    },

    findByEmail: (email) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
                if (err) reject(err);
                resolve(results[0]);
            });
        });
    },


    updateProfile: (userId, username, email, password, role) => {
        return new Promise((resolve, reject) => {
            let query = '';
            let params = [];

            // Якщо пароль передано, то оновлюємо і його
            if (password) {
                query = 'UPDATE users SET username = ?, email = ?, password = ? WHERE id = ?';
                params = [username, email, password, userId];
            }
            else if (role) {
                query = 'UPDATE users SET role = ? WHERE id = ?';
                params = [role, userId];
            }
            else {
                // Якщо пароль не змінюється, оновлюємо лише username та email
                query = 'UPDATE users SET username = ?, email = ? WHERE id = ?';
                params = [username, email, userId];
            }

            // Виконуємо оновлення в базі даних
            db.query(query, params, (err, results) => {
                if (err) return reject(err);

                // Після оновлення отримуємо дані користувача з бази
                db.query('SELECT id, username, email, created_at, role FROM users WHERE id = ?', [userId], (err, rows) => {
                    if (err) return reject(err);

                    // Повертаємо оновленого користувача
                    resolve(rows[0]);  // Повертаємо перший рядок, оскільки `id` унікальний
                });
            });
        });
    },


    getUserById: (userId) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?', [userId], (err, results) => {
                if (err) reject(err);
                resolve(results[0]);
            });
        });
    },

    getAllUsers: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM users', [], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    deleteUser: (userId) => {
        return new Promise((resolve, reject) => {

            // Видалення користувача
            db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
                if (err) return reject(err);
                resolve(result);  // Якщо все добре, повертаємо результат
            });
        });
    },

     getLastRequestByUserId: (userId) => {
         return new Promise((resolve, reject) => {
             db.query('SELECT * FROM role_upgrade_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [userId], (err, results) => {
                 if (err) reject(err);
                 resolve(results[0]);
             });
         });
    },

    createPrivilegeRequest: (userId, comment) => {
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO role_upgrade_requests (user_id, user_comment) VALUES (?, ?)', [userId, comment], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

     getAllPendingPrivilegeRequests: () => {
        return new Promise((resolve, reject) => {
            const query = `
                        SELECT r.*, u.username as user_username
                        FROM role_upgrade_requests r
                        JOIN users u ON r.user_id = u.id
                        WHERE r.status = 'pending'
                    `;
            db.query(query, [], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    approvePrivilegeRequest: (requestId, adminId) => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE role_upgrade_requests SET status = "approved", admin_id = ? WHERE id = ?', [adminId, requestId], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    rejectPrivilegeRequest: (requestId, adminId, comment) => {
        return new Promise((resolve, reject) => {
            db.query('UPDATE role_upgrade_requests SET status = "rejected", admin_id = ?, admin_comment = ? WHERE id = ?', [adminId, comment, requestId], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },

    getPrivilegeRequestById: (requestId) => {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM role_upgrade_requests WHERE id = ?', [requestId], (err, results) => {
                if (err) reject(err);
                resolve(results);
            });
        });
    },
};

module.exports = User;