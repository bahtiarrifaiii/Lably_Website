require("dotenv").config({ quiet: true });
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "lably_website",
  timezone: "+07:00",
  dateStrings: true,
});

db.connect((err) => {
  if (err) {
    console.log("Database Connection Error: ", err);
    return;
  }
  console.log("Connected to MySQL (phpMyAdmin)");
});

module.exports = db;
