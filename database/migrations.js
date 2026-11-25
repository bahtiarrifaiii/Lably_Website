const db = require("../config/database");

/**
 * Runs idempotent startup schema checks and status normalization
 * to ensure required extension columns exist on existing databases.
 */
function runStartupMigrations() {
  const alterQueries = [
    {
      sql: "ALTER TABLE d_peminjaman ADD COLUMN extend_from INT DEFAULT NULL",
      label: "extend_from to d_peminjaman",
    },
    {
      sql: "ALTER TABLE peminjaman ADD COLUMN extend_from INT DEFAULT NULL",
      label: "extend_from to peminjaman",
    },
    {
      sql: "ALTER TABLE peminjaman ADD COLUMN original_tgl_kembali DATE DEFAULT NULL",
      label: "original_tgl_kembali to peminjaman",
    },
    {
      sql: "ALTER TABLE peminjaman ADD COLUMN original_price VARCHAR(255) DEFAULT NULL",
      label: "original_price to peminjaman",
    },
  ];

  alterQueries.forEach(({ sql, label }) => {
    db.query(sql, (err) => {
      if (err && err.code !== "ER_DUP_FIELDNAME") {
        console.error(`Error adding ${label}:`, err);
      }
    });
  });

  db.query(
    "UPDATE peminjaman SET status = 'pending' WHERE COALESCE(status, '') = ''",
    (err) => {
      if (err) {
        console.error("Error normalizing peminjaman status:", err);
      }
    },
  );
}

module.exports = { runStartupMigrations };
