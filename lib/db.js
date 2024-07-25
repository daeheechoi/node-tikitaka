var mysql = require('mysql2');
var db = mysql.createConnection({
    host: '192.168.6.45',
    port: 3306,
    user: 'admin',
    password: '123',
    database: 'tikitaka'
});
db.connect();

module.exports = db;