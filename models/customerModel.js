const database = require("../config/database");

const Customer = {

    getPaginated: (limit, offset, callback) => {
        const sql = `
            SELECT * FROM users
            ORDER BY id ASC
            LIMIT ? OFFSET ?
        `;
        database.query(sql, [limit, offset], callback);
    },

    countAll: (callback) => {
        const sql = "SELECT COUNT(*) AS total FROM users";
        database.query(sql, callback);
    }
};

module.exports = Customer;
