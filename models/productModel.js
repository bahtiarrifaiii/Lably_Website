// models/productModel.js
const database = require("../config/database");

const Product = {
  getAll: (callback) => {
    const query = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN category c ON p.id_category = c.id
      ORDER BY p.id DESC
    `;
    database.query(query, callback);
  },

  getById: (id, callback) => {
    const query = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN category c ON p.id_category = c.id
      WHERE p.id = ?
    `;
    database.query(query, [id], callback);
  },

  // LIST + SEARCH + PAGINATION — FIXED VERSION
  getPaginated: (search, limit, offset, callback) => {
    let query = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN category c ON p.id_category = c.id
    `;
    const params = [];

    if (search && search.trim() !== "") {
      query += `
        WHERE (
             p.name LIKE ?
          OR CAST(p.stock AS CHAR) LIKE ?
          OR p.kondisi LIKE ?
          OR CAST(p.price AS CHAR) LIKE ?
          OR c.name LIKE ?
        )
      `;
      const like = `%${search}%`;
      params.push(like, like, like, like, like);
    }

    query += `
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    database.query(query, params, callback);
  },

  // COUNT — FIXED VERSION
  count: (search, callback) => {
    let query = `
      SELECT COUNT(*) AS total
      FROM products p
      LEFT JOIN category c ON p.id_category = c.id
    `;
    const params = [];

    if (search && search.trim() !== "") {
      query += `
        WHERE (
             p.name LIKE ?
          OR CAST(p.stock AS CHAR) LIKE ?
          OR p.kondisi LIKE ?
          OR CAST(p.price AS CHAR) LIKE ?
          OR c.name LIKE ?
        )
      `;
      const like = `%${search}%`;
      params.push(like, like, like, like, like);
    }

    database.query(query, params, callback);
  },

  findByName: (name, callback) => {
    const query = `SELECT * FROM products WHERE name = ?`;
    database.query(query, [name], callback);
  },

  findByNameExcludingId: (name, id, callback) => {
    const query = `SELECT * FROM products WHERE name = ? AND id != ?`;
    database.query(query, [name, id], callback);
  },

  create: (data, callback) => {
    const query = `
      INSERT INTO products (name, description, id_category, stock, kondisi, price, image)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    database.query(
      query,
      [
        data.name,
        data.description,
        data.id_category,
        data.stock,
        data.kondisi,
        data.price,
        data.image,
      ],
      callback
    );
  },

  update: (id, data, callback) => {
    const query = `
      UPDATE products
      SET name = ?, description = ?, id_category = ?, stock = ?, kondisi = ?, price = ?, image = ?
      WHERE id = ?
    `;

    database.query(
      query,
      [
        data.name,
        data.description,
        data.id_category,
        data.stock,
        data.kondisi,
        data.price,
        data.image,
        id,
      ],
      callback
    );
  },

  delete: (id, callback) => {
    const query = `DELETE FROM products WHERE id = ?`;
    database.query(query, [id], callback);
  },
};

Product.getAllWithCategory = (callback) => {
  const query = `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN category c ON p.id_category = c.id
    ORDER BY p.id DESC
  `;
  database.query(query, callback);
};


module.exports = Product;
