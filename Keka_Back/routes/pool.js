const mysql = require("mysql");

const pool = mysql.createPool({
  host: "campusshala.com",
  port: 3306,
  user: "campussh_keka",
  database: "campussh_keka",
  password: "Vikram123@@",
  multipleStatements: true,
});

module.exports = pool;
