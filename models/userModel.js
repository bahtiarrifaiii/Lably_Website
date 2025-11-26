const database = require("../config/database");

const User = {
    create: (data, callback) => {
        const sql = `
            INSERT INTO users (username, email, password, status)
            VALUES (?, ?, ?, 'active')
        `;
        database.query(sql, [data.username, data.email, data.password], callback);
    },


    findByEmail: (email, callback) => {
        const sql = "SELECT * FROM users WHERE email = ?";
        database.query(sql, [email], callback);
    },

    // Tambahan untuk dashboard
    getAll: (callback) => {
        const sql = "SELECT * FROM users";
        database.query(sql, callback);
    },

    updateLastLogin: (id, callback) => {
        const sql = "UPDATE users SET last_login = NOW() WHERE id = ?";
        database.query(sql, [id], callback);
    },

    reactivate: (id, callback) => {
        const sql = "UPDATE users SET status = 'active' WHERE id = ?";
        database.query(sql, [id], callback);
    },


    deactivateInactive: (callback) => {
        const sql = `
            UPDATE users
            SET status = 'inactive'
            WHERE (status = 'active' OR status IS NULL)
            AND last_login IS NOT NULL
            AND TIMESTAMPDIFF(MINUTE, last_login, NOW()) > 3
        `;
        database.query(sql, callback);
    }
};

module.exports = User;
