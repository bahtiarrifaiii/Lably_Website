const path = require("path");
const ejs = require("ejs");
const db = require("../../config/database");
const User = require("../../models/userModel");

module.exports = {
  list: (req, res) => {
    const { search, filter, start, end } = req.query;

    const updateOverdueSql = `
      UPDATE peminjaman
      SET status = 'overdue'
      WHERE status = 'in use' AND DATE(tgl_kembali) < CURDATE()
    `;

    db.query(updateOverdueSql, (uErr) => {
      if (uErr) console.error("ERROR updating overdue statuses:", uErr);

      let sql = `
        SELECT 
          p.id,
          u.username AS username,
          pr.name AS product_name,
          DATE_FORMAT(p.tgl_pinjam, '%Y-%m-%d') AS tgl_pinjam,
          DATE_FORMAT(p.tgl_kembali, '%Y-%m-%d') AS tgl_kembali,
          p.status
        FROM peminjaman p
        LEFT JOIN users u ON p.id_user = u.id
        LEFT JOIN products pr ON p.id_products = pr.id
        WHERE COALESCE(p.status, '') NOT IN ('completed')
      `;

      const params = [];

      if (search) {
        sql += ` AND (u.username LIKE ? OR pr.name LIKE ? OR COALESCE(p.status, '') LIKE ?) `;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (filter && filter !== "all") {
        if (filter === "pending") {
          sql += ` AND COALESCE(p.status, '') IN ('pending', 'waiting', '') `;
        } else {
          sql += ` AND COALESCE(p.status, '') = ? `;
          params.push(filter);
        }
      }

      if (start) {
        sql += ` AND DATE(p.tgl_pinjam) >= ? `;
        params.push(start);
      }

      if (end) {
        sql += ` AND DATE(p.tgl_kembali) <= ? `;
        params.push(end);
      }

      sql += ` ORDER BY p.id DESC `;

      db.query(sql, params, (err, filteredOrders) => {
        if (err) {
          console.error("ORDER QUERY ERROR:", err);
          return res.status(500).send("Error loading orders.");
        }

        db.query("SELECT status FROM peminjaman", (err2, allOrders) => {
          if (err2) {
            console.error("COUNT QUERY ERROR:", err2);
            return res.status(500).send("Error loading totals.");
          }

          const totalPending = allOrders.filter(
            (o) => o.status === "pending" || o.status === "waiting",
          ).length;
          const totalLoaned = allOrders.filter(
            (o) => o.status === "in use",
          ).length;
          const totalOverdue = allOrders.filter(
            (o) => o.status === "overdue",
          ).length;

          User.getAll((errUsers, users) => {
            const totalCustomers = users ? users.length : 0;

            ejs.renderFile(
              path.join(__dirname, "../../views/pages/admin/order/order.ejs"),
              {
                users,
                totalCustomers,
                orders: filteredOrders,
                totalPending,
                totalLoaned,
                totalOverdue,
                search,
                filter,
                start,
                end,
              },
              (renderErr, content) => {
                if (renderErr) return res.status(500).send("Render Error");

                res.render("layouts/admin", {
                  title: "Orders | Lably",
                  style: `<link rel="stylesheet" href="/css/admin/order.css">`,
                  content,
                  message: null,
                  showPopup: false,
                  currentPage: req.path,
                });
              },
            );
          });
        });
      });
    });
  },

  approve: (req, res) => {
    db.query(
      "UPDATE peminjaman SET status = 'in use', original_tgl_kembali = NULL, original_price = NULL WHERE id = ?",
      [req.params.id],
      () => res.redirect("/order"),
    );
  },

  reject: (req, res) => {
    const { id } = req.params;

    db.query(
      "SELECT id_products, qty, status FROM peminjaman WHERE id = ?",
      [id],
      (err, results) => {
        if (err || !results || results.length === 0) {
          console.error("ERROR fetching peminjaman for reject:", err);
          return res.redirect("/order");
        }

        const row = results[0];
        const productId = row.id_products;
        const qty = Number(row.qty) || 0;
        const isExtensionRequest = row.status === "waiting";

        if (isExtensionRequest) {
          db.query(
            "UPDATE peminjaman SET tgl_kembali = COALESCE(original_tgl_kembali, tgl_kembali), price = COALESCE(original_price, price), status = 'in use', original_tgl_kembali = NULL, original_price = NULL WHERE id = ?",
            [id],
            () => res.redirect("/order"),
          );
          return;
        }

        const deleteOrder = () => {
          db.query("DELETE FROM reminder WHERE id_peminjaman = ?", [id], () => {
            db.query("DELETE FROM peminjaman WHERE id = ?", [id], () => {
              res.redirect("/order");
            });
          });
        };

        if (qty > 0) {
          db.query(
            "UPDATE products SET stock = stock + ? WHERE id = ?",
            [qty, productId],
            (err2) => {
              if (err2) {
                console.error("ERROR restoring stock on reject:", err2);
              }
              deleteOrder();
            },
          );
        } else {
          deleteOrder();
        }
      },
    );
  },

  complete: (req, res) => {
    const { id } = req.params;

    db.query(
      "SELECT id_products, qty, status FROM peminjaman WHERE id = ?",
      [id],
      (err, results) => {
        if (err) {
          console.error("ERROR fetching peminjaman:", err);
          return res.redirect("/order");
        }

        if (!results || results.length === 0) {
          req.session.message = {
            type: "error",
            text: "Peminjaman tidak ditemukan.",
          };
          return res.redirect("/order");
        }

        const row = results[0];
        const productId = row.id_products;
        const qty = Number(row.qty) || 0;

        if (row.status === "completed") {
          db.query("DELETE FROM reminder WHERE id_peminjaman = ?", [id], () => {
            return res.redirect("/order");
          });
          return;
        }

        db.query(
          "UPDATE products SET stock = stock + ? WHERE id = ?",
          [qty, productId],
          (err2) => {
            if (err2) {
              console.error("ERROR restoring stock:", err2);
            }
            db.query(
              "UPDATE peminjaman SET status = 'completed' WHERE id = ?",
              [id],
              () => {
                db.query(
                  "DELETE FROM reminder WHERE id_peminjaman = ?",
                  [id],
                  () => res.redirect("/order"),
                );
              },
            );
          },
        );
      },
    );
  },

  sendReminder: (req, res) => {
    const peminjamanId = req.params.id;
    const sql = `
      INSERT INTO reminder (id_peminjaman, sent_at)
      VALUES (?, NOW())
    `;

    db.query(sql, [peminjamanId], (err) => {
      if (err) {
        console.error("REMINDER ERROR:", err);
      }
      res.redirect("/order");
    });
  },

  completedList: (req, res) => {
    const { search, filter, start, end } = req.query;

    let sql = `
      SELECT 
        p.id,
        u.username AS username,
        pr.name AS product_name,
        DATE_FORMAT(p.tgl_pinjam, '%Y-%m-%d') AS tgl_pinjam,
        DATE_FORMAT(p.tgl_kembali, '%Y-%m-%d') AS tgl_kembali,
        p.status,
        (p.tgl_kembali < CURDATE()) AS overdue_flag
      FROM peminjaman p
      LEFT JOIN users u ON p.id_user = u.id
      LEFT JOIN products pr ON p.id_products = pr.id
      WHERE p.status = 'completed'
    `;

    const params = [];

    if (search) {
      sql += ` AND (u.username LIKE ? OR pr.name LIKE ?) `;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (filter === "completed") {
      sql += ` AND (p.tgl_kembali >= CURDATE()) `;
    }

    if (filter === "overdue") {
      sql += ` AND (p.tgl_kembali < CURDATE()) `;
    }

    if (start) {
      sql += ` AND DATE(p.tgl_pinjam) >= ? `;
      params.push(start);
    }

    if (end) {
      sql += ` AND DATE(p.tgl_kembali) <= ? `;
      params.push(end);
    }

    sql += ` ORDER BY p.id DESC `;

    db.query(sql, params, (err, orders) => {
      if (err) {
        console.error("COMPLETED QUERY ERROR:", err);
        return res.status(500).send("Error loading completed orders.");
      }

      db.query(
        "SELECT COUNT(*) AS totalCompleted FROM peminjaman WHERE status='completed'",
        (err2, totalData) => {
          const totalCompleted = totalData ? totalData[0].totalCompleted : 0;

          User.getAll((errUsers, users) => {
            const totalCustomers = users ? users.length : 0;

            ejs.renderFile(
              path.join(
                __dirname,
                "../../views/pages/admin/order/order-completed.ejs",
              ),
              {
                users,
                totalCustomers,
                orders,
                totalCompleted,
                search,
                filter,
                start,
                end,
              },
              (renderErr, content) => {
                if (renderErr) return res.status(500).send("Render Error");

                res.render("layouts/admin", {
                  title: "Orders Completed",
                  style: `<link rel="stylesheet" href="/css/admin/order-completed.css">`,
                  content,
                  message: null,
                  showPopup: false,
                  currentPage: req.path,
                });
              },
            );
          });
        },
      );
    });
  },
};
