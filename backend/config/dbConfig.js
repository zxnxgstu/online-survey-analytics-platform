const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const host = process.env.DBHOST || 'localhost';
const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(host);
const sslEnv = process.env.DBSSL;
const sslEnabled = sslEnv == null
    ? !isLocalHost
    : ['1', 'true', 'yes', 'required'].includes(String(sslEnv).toLowerCase());

const dbConfig = {
    host,
    port: Number(process.env.DBPORT || 3306),
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
};

if (sslEnabled) {
    const caPath = process.env.DBCA
        ? path.resolve(process.env.DBCA)
        : path.join(__dirname, 'ca.pem');

    dbConfig.ssl = {
        rejectUnauthorized: true,
        ...(fs.existsSync(caPath) ? { ca: fs.readFileSync(caPath) } : {}),
    };
}

const db = mysql.createPool(dbConfig);

// Fail fast on startup when database credentials/SSL are invalid.
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        return;
    }
    console.log('Database connected successfully.');
    connection.release();
});

module.exports = { db, dbConfig };
