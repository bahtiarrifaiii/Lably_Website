const path = require("path");
const ejs = require("ejs");
const db = require("../../config/database");
const User = require("../../models/userModel");

module.exports = {
  analytics: (req, res) => {
    User.getAll((err, users) => {
      const totalCustomers = users ? users.length : 0;

      db.query("SELECT COUNT(*) AS total FROM products", (err1, result1) => {
        if (err1) {
          console.error("Error count products:", err1);
          return res.status(500).send("Error loading analytics");
        }

        const totalItems = result1[0]?.total || 0;

        db.query("SELECT COUNT(*) AS total FROM peminjaman", (err2, result2) => {
          if (err2) {
            console.error("Error count orders:", err2);
            return res.status(500).send("Error loading analytics");
          }

          const totalTransactions = result2[0]?.total || 0;

          db.query(
            `SELECT COALESCE(SUM(CAST(price AS DECIMAL(15, 2))), 0) AS total
             FROM peminjaman
             WHERE extend_from IS NULL OR status <> 'pending'`,
            (err3, result3) => {
              if (err3) {
                console.error("Error sum income:", err3);
                return res.status(500).send("Error loading analytics");
              }

              const totalIncome = result3[0]?.total || 0;

              const topItemsSql = `
                SELECT 
                  pr.id,
                  pr.name AS product_name,
                  SUM(p.qty) AS total_qty
                FROM peminjaman p
                LEFT JOIN products pr ON p.id_products = pr.id
                WHERE pr.id IS NOT NULL
                GROUP BY pr.id, pr.name
                ORDER BY total_qty DESC
                LIMIT 5
              `;

              db.query(topItemsSql, (err4, topItems) => {
                if (err4) {
                  console.error("Error top items:", err4);
                  return res.status(500).send("Error loading analytics");
                }

                const topCustomersSql = `
                  SELECT 
                    u.id,
                    u.username AS customer_name,
                    COUNT(p.id) AS transaction_count
                  FROM peminjaman p
                  LEFT JOIN users u ON p.id_user = u.id
                  WHERE u.id IS NOT NULL
                  GROUP BY u.id, u.username
                  ORDER BY transaction_count DESC
                  LIMIT 5
                `;

                db.query(topCustomersSql, (err5, topCustomers) => {
                  if (err5) {
                    console.error("Error top customers:", err5);
                    return res.status(500).send("Error loading analytics");
                  }

                  const monthlySql = `
                    SELECT MONTH(tgl_pinjam) AS mon, COUNT(*) AS cnt
                    FROM peminjaman
                    WHERE tgl_pinjam IS NOT NULL AND YEAR(tgl_pinjam) = YEAR(CURDATE())
                    GROUP BY MONTH(tgl_pinjam)
                  `;

                  db.query(monthlySql, (err6, monthlyRows) => {
                    if (err6) {
                      console.error("Error monthly stats:", err6);
                      return res.status(500).send("Error loading analytics");
                    }

                    const monthlyData = new Array(12).fill(0);
                    (monthlyRows || []).forEach((r) => {
                      const m = Number(r.mon);
                      if (!Number.isNaN(m) && m >= 1 && m <= 12) {
                        monthlyData[m - 1] = r.cnt;
                      }
                    });

                    ejs.renderFile(
                      path.join(__dirname, "../../views/pages/admin/analytics.ejs"),
                      {
                        users,
                        totalCustomers,
                        totalItems,
                        totalTransactions,
                        totalIncome,
                        topItems: topItems || [],
                        topCustomers: topCustomers || [],
                        monthlyData,
                      },
                      (renderErr, content) => {
                        if (renderErr) return res.status(500).send("Render Error");

                        res.render("layouts/admin", {
                          title: "Analytics",
                          style: `<link rel="stylesheet" href="/css/admin/analytics.css">`,
                          content,
                          showPopup: false,
                          message: null,
                          currentPage: req.path,
                        });
                      },
                    );
                  });
                });
              });
            },
          );
        });
      });
    });
  },

  invoice: (req, res) => {
    const sql = `
      SELECT 
        p.id,
        u.username AS customer_name,
        pr.name AS product_name,
        DATE_FORMAT(p.tgl_pinjam, '%Y-%m-%d') AS tgl_pinjam,
        DATE_FORMAT(p.tgl_kembali, '%Y-%m-%d') AS tgl_kembali,
        p.status,
        p.price
      FROM peminjaman p
      LEFT JOIN users u ON p.id_user = u.id
      LEFT JOIN products pr ON p.id_products = pr.id
      WHERE p.status = 'completed'
      ORDER BY p.id DESC
    `;

    db.query(sql, (err, orders) => {
      if (err) {
        console.error("INVOICE ERROR:", err);
        return res.status(500).send("Error loading invoice.");
      }

      ejs.renderFile(
        path.join(__dirname, "../../views/pages/admin/invoice.ejs"),
        { orders },
        (renderErr, content) => {
          if (renderErr) return res.status(500).send("Render Error");

          res.render("layouts/admin", {
            title: "Invoice",
            style: `<link rel="stylesheet" href="/css/admin/invoice.css">`,
            content,
            showPopup: false,
            message: null,
            currentPage: req.path,
          });
        },
      );
    });
  },
};
