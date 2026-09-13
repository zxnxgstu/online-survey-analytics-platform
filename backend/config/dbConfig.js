const mysql = require('mysql');

const dbConfig = {
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME
}

const db = mysql.createConnection(dbConfig);

db.connect((err) => {
    if (err) throw err;
    console.log('БД підключена успішно!');
});

module.exports = {db, dbConfig};