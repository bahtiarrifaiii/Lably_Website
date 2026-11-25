const database = require("../config/database");

const Category = {

    getAll: (callback) => {
        database.query("SELECT * FROM category ORDER BY id DESC", callback);
    },

    getById: (id, callback) => {
        database.query("SELECT * FROM category WHERE id = ?", [id], callback);
    },

    findByName: (name, callback) => {
        database.query("SELECT * FROM category WHERE name = ?", [name], callback);
    },

    create: (name, callback) => {
        database.query(
            "INSERT INTO category (name) VALUES (?)",
            [name],
            callback
        );
    },

    update: (id, name, callback) => {
        database.query(
            "UPDATE category SET name = ? WHERE id = ?",
            [name, id],
            callback
        );
    },

    delete: (id, callback) => {
        database.query("DELETE FROM category WHERE id = ?", [id], callback);
    },

    countProducts: (id, callback) => {
        database.query(
            "SELECT COUNT(*) AS total FROM products WHERE id_category = ?",
            [id],
            callback
        );
    }
};

module.exports = Category;
