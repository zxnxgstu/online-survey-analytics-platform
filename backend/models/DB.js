const mysql = require('mysql2/promise');
const dbConfig = require('../config/dbConfig');

const pool = mysql.createPool(dbConfig);

exports.getDbStats = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Доступ дозволено лише адміністраторам' });
    }

    try {
        const connection = await pool.getConnection();

        // Кількість таблиць
        const [tableCountRows] = await connection.query(`
            SELECT COUNT(*) as count
            FROM information_schema.tables
            WHERE table_schema = ?
        `, [dbConfig.database]);
        const tableCount = tableCountRows[0].count;

        // Розмір бази даних
        const [sizeRows] = await connection.query(`
            SELECT CONCAT(ROUND(SUM(data_length + index_length) / 1024 / 1024, 2), ' MB') as size
            FROM information_schema.tables
            WHERE table_schema = ?
        `, [dbConfig.database]);
        const size = sizeRows[0].size;

        // Кількість записів
        const tables = ['users', 'polls', 'votes', 'categories', 'poll_options', 'rating_responses', 'text_responses', 'poll_moderation'];
        const recordCounts = {};
        for (const table of tables) {
            const [countRows] = await connection.query(`SELECT COUNT(*) as count FROM ??`, [table]);
            recordCounts[table] = countRows[0].count;
        }

        // Останнє резервне копіювання (фіктивна дата)
        const lastBackup = "2025-05-08 03:00:00";

        connection.release();
        res.json({
            tables: tableCount,
            size,
            records: recordCounts,
            lastBackup
        });
    } catch (err) {
        res.status(500).json({ message: 'Помилка отримання статистики бази даних', error: err.message });
    }
};

exports.executeSqlQuery = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Доступ дозволено лише адміністраторам' });
    }

    const { query } = req.body;
    if (!query || !query.trim().toLowerCase().startsWith('select')) {
        return res.status(400).json({ message: 'Дозволено лише SELECT-запити' });
    }

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query(query);
        connection.release();
        res.json(rows);
    } catch (err) {
        res.status(400).json({ message: 'Помилка виконання SQL-запиту', error: err.message });
    }
};