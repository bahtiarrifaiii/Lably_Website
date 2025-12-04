const database = require("../config/database");

const Order = {
    // Insert multiple peminjaman rows for a user. `items` is an array of objects
    // with keys: product_id, quantity, borrow_date, return_date, price/itemTotal, no_telp, alamat
  createOrders: (userId, items, callback) => {
    if (!items || items.length === 0) return callback(null, { affectedRows: 0 });

    const values = items.map((it) => {
      const priceVal = it.itemTotal != null ? it.itemTotal : it.all_total || it.price || 0;

      // Normalize dates: if provided as YYYY-MM-DD, append time portion
      const tgl_pinjam = it.borrow_date ? `${it.borrow_date} 00:00:00` : new Date().toISOString().slice(0, 19).replace('T', ' ');
      const tgl_kembali = it.return_date ? `${it.return_date} 00:00:00` : new Date().toISOString().slice(0, 19).replace('T', ' ');

      const status = it.status || "pending";
      const qty = Number(it.quantity) || 1;
      // Ensure non-null values for required fields
      const telp = String(it.phone || it.no_telp || "").trim() || "-";
      const alamat = String(it.address || it.alamat || "").trim() || "-";

      return [userId, it.product_id, String(priceVal), tgl_pinjam, tgl_kembali, status, qty, telp, alamat];
    });        const sql = `
            INSERT INTO peminjaman (id_user, id_products, price, tgl_pinjam, tgl_kembali, status, qty, no_telp, alamat)
            VALUES ?
        `;

        database.query(sql, [values], callback);
    },

    // simple helper to fetch all peminjaman
    getAll: (callback) => {
        database.query("SELECT * FROM peminjaman ORDER BY id DESC", callback);
    },
};

module.exports = Order;
