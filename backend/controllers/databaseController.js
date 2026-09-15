const mysql = require('mysql2/promise');
const { dbConfig } = require('../config/dbConfig');

const pool = mysql.createPool(dbConfig);
const TABLES = [
    'users', 'polls', 'votes', 'categories', 'poll_options',
    'rating_responses', 'text_responses', 'poll_moderation', 'role_upgrade_requests'
];

exports.getDbStats = async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [tableCountRows] = await connection.query(`
            SELECT COUNT(*) AS count
            FROM information_schema.tables
            WHERE table_schema = ?
        `, [dbConfig.database]);
        const [sizeRows] = await connection.query(`
            SELECT COALESCE(CONCAT(ROUND(SUM(data_length + index_length) / 1024 / 1024, 2), ' MB'), '0 MB') AS size
            FROM information_schema.tables
            WHERE table_schema = ?
        `, [dbConfig.database]);

        const recordCounts = {};
        for (const table of TABLES) {
            const [rows] = await connection.query('SELECT COUNT(*) AS count FROM ??', [table]);
            recordCounts[table] = Number(rows[0].count);
        }

        return res.json({
            tables: Number(tableCountRows[0].count),
            size: sizeRows[0].size,
            records: recordCounts,
            lastBackup: null,
        });
    } catch (err) {
        return res.status(500).json({ message: 'Помилка отримання статистики бази даних', error: err.message });
    } finally {
        if (connection) connection.release();
    }
};

exports.executeSqlQuery = async (req, res) => {
    const query = String(req.body.query || '').trim();
    const normalized = query.replace(/^\s*\/\*[\s\S]*?\*\/\s*/, '').toLowerCase();

    if (!/^select\b/.test(normalized) && !/^show\b/.test(normalized) && !/^describe\b/.test(normalized) && !/^explain\b/.test(normalized)) {
        return res.status(400).json({ message: 'Дозволено лише запити для читання (SELECT/SHOW/DESCRIBE/EXPLAIN)' });
    }
    if (/\b(password|dbpass|jwt_secret)\b/i.test(query)) {
        return res.status(400).json({ message: 'Запит до чутливих полів заборонено' });
    }
    if (query.includes(';') && query.replace(/;\s*$/, '').includes(';')) {
        return res.status(400).json({ message: 'Дозволено лише один SQL-запит за раз' });
    }

    let connection;
    try {
        connection = await pool.getConnection();
        const [rows] = await connection.query(query);
        return res.json(rows);
    } catch (err) {
        return res.status(400).json({ message: 'Помилка виконання SQL-запиту', error: err.message });
    } finally {
        if (connection) connection.release();
    }
};
