const path = require("path");
const ejs = require("ejs");
const db = require("../../config/database");
const Product = require("../../models/productModel");
const User = require("../../models/userModel");
const Draft = require("../../models/draftModel");
const { parseCurrency } = require("../../utils/dateAndCurrency");

module.exports = {
  formPage: async (req, res) => {
    const formSpecificScript = "/js/form-user.js";
    const message = req.session.message || null;
    req.session.message = null;

    const productId = req.query.product_id;
    const qty = parseInt(req.query.qty, 10) || 1;
    const action = req.query.action;
    const borrowDate = req.query.borrow_date || "";
    const extendOrderId = req.query.extend_order_id || "";

    if (!productId) {
      req.session.message = "ID Produk tidak ditemukan.";
      return res.redirect("/catalogue");
    }

    if (!action) {
      req.session.message = "Aksi pemesanan tidak valid.";
      return res.redirect("/catalogue");
    }

    const proceedToRenderForm = () => {
      Product.getById(productId, (err, productRows) => {
        if (err) {
          console.error("Database Error (Product):", err);
          req.session.message =
            "Terjadi kesalahan server saat mengambil data produk.";
          return res.redirect("/catalogue");
        }

        if (!productRows || productRows.length === 0) {
          req.session.message = "Produk tidak ditemukan.";
          return res.redirect("/catalogue");
        }

        const product = productRows[0];
        const priceTotal = product.price * qty;

        User.getById(req.session.user.id, (userErr, userRows) => {
          if (userErr) {
            console.error("Database Error (User):", userErr);
            req.session.message =
              "Terjadi kesalahan server saat mengambil data pengguna.";
            return res.redirect("/login");
          }

          if (!userRows || userRows.length === 0) {
            req.session.message =
              "Sesi pengguna tidak valid. Silakan login kembali.";
            return res.redirect("/login");
          }

          const user = userRows[0];

          ejs.renderFile(
            path.join(__dirname, "../../views/pages/user/form.ejs"),
            {
              message,
              product,
              qty,
              priceTotal,
              user,
              action,
              borrowDate,
              extendOrderId,
            },
            (renderErr, content) => {
              if (renderErr) {
                console.error("EJS Render Error:", renderErr);
                req.session.message =
                  "Terjadi kesalahan saat membuat tampilan formulir.";
                return res.redirect("/catalogue");
              }

              res.render("layouts/forms", {
                title: "Form | Lably",
                meta: `
                  <meta name="description" content="Form peminjaman alat laboratorium LabLy." />
                  <meta name="keywords" content="LabLy, alat riset, laboratorium" />
                `,
                style: "",
                content,
                scriptFile: formSpecificScript,
              });
            },
          );
        });
      });
    };

    if (action === "extend") {
      if (!extendOrderId) {
        req.session.message = "ID peminjaman tidak ditemukan.";
        return res.redirect("/order-user");
      }

      const extendCheckSql = `
        SELECT
          p.id,
          p.status,
          (
            SELECT COUNT(*)
            FROM peminjaman x
            WHERE x.extend_from = p.id
            AND x.status = 'pending'
          ) AS pending_extend
        FROM peminjaman p
        WHERE p.id = ?
        AND p.id_user = ?
        LIMIT 1
      `;

      return db
        .promise()
        .query(extendCheckSql, [extendOrderId, req.session.user.id])
        .then(([orderRows]) => {
          const order = orderRows && orderRows[0];

          if (!order) {
            req.session.message = "Peminjaman tidak ditemukan.";
            return res.redirect("/order-user");
          }

          if (
            String(order.status).toLowerCase() !== "in use" ||
            Number(order.pending_extend) > 0
          ) {
            req.session.message = {
              type: "warning",
              text: "Perpanjangan hanya dapat diajukan setelah barang disetujui dan sedang dipinjam.",
            };
            return res.redirect(`/order-detail/${extendOrderId}`);
          }

          return proceedToRenderForm();
        })
        .catch((err) => {
          console.error("Database Error (Extend Check):", err);
          req.session.message = "Gagal memeriksa status peminjaman.";
          return res.redirect("/order-user");
        });
    }

    return proceedToRenderForm();
  },

  submitData: async (req, res) => {
    const {
      action_type,
      quantity,
      product_id,
      borrow_date,
      return_date,
      all_total,
      all_total_raw,
      phone,
      address,
      extend_order_id,
    } = req.body;

    const userId = req.session.user && req.session.user.id;
    parseCurrency(all_total, all_total_raw);

    if (!userId) {
      req.session.message = "User tidak valid.";
      return res.redirect("/login");
    }

    if (action_type === "cart") {
      Product.getById(product_id, (err, productRows) => {
        if (err) {
          console.error("Database Error (Product):", err);
          req.session.message = "Gagal menambahkan produk ke keranjang.";
          return res.redirect("/catalogue");
        }

        const product = productRows && productRows[0];
        if (!product) {
          req.session.message = "Produk tidak ditemukan.";
          return res.redirect("/catalogue");
        }

        const qtyNum = Number(quantity) || 1;
        if (qtyNum <= 0 || qtyNum > Number(product.stock)) {
          req.session.message = {
            type: "error",
            text: "Jumlah yang diminta melebihi stok tersedia.",
          };
          return res.redirect(`/product/${product.id}`);
        }

        const draftData = {
          product_id: product.id,
          price: product.price,
          borrow_date: borrow_date || null,
          return_date: return_date || null,
          quantity: qtyNum,
          phone: phone || "",
          address: address || "",
          extend_from: null,
        };

        Draft.add(userId, draftData, (err2) => {
          if (err2) {
            console.error("Gagal simpan draft:", err2);
            req.session.message = "Gagal menyimpan ke keranjang.";
            return res.redirect("/catalogue");
          }
          return res.redirect("/cart");
        });
      });
    } else if (action_type === "loan" || action_type === "extend") {
      Product.getById(product_id, (err, productRows) => {
        if (err) {
          console.error("Database Error (Product):", err);
          req.session.message = "Gagal memproses peminjaman.";
          return res.redirect("/catalogue");
        }

        const product = productRows && productRows[0];
        if (!product) {
          req.session.message = "Produk tidak ditemukan.";
          return res.redirect("/catalogue");
        }

        const qtyNum = Number(quantity) || 1;

        if (action_type !== "extend") {
          if (qtyNum <= 0 || qtyNum > Number(product.stock)) {
            req.session.message = {
              type: "error",
              text: "Jumlah yang diminta melebihi stok tersedia.",
            };
            return res.redirect(`/product/${product.id}`);
          }
        }

        const draftData = {
          product_id: product.id,
          price: product.price,
          borrow_date: borrow_date || null,
          return_date: return_date || null,
          quantity: qtyNum,
          phone: phone || "",
          address: address || "",
          extend_from:
            action_type === "extend" ? Number(extend_order_id) : null,
        };

        const saveDraft = () => {
          Draft.deleteByUser(userId, (errDel) => {
            if (errDel) {
              console.error("Gagal menghapus draft lama:", errDel);
            }

            Draft.add(userId, draftData, (err2) => {
              if (err2) {
                console.error("Gagal simpan draft:", err2);
                req.session.message = {
                  type: "error",
                  text: "Gagal menyimpan peminjaman.",
                };
                return res.redirect("/catalogue");
              }
              return res.redirect("/checkout");
            });
          });
        };

        if (action_type === "extend") {
          const checkSql = `
            SELECT
              p.id,
              p.status,
              (
                SELECT COUNT(*)
                FROM peminjaman x
                WHERE x.extend_from = p.id
                AND x.status = 'pending'
              ) AS pending_extend
            FROM peminjaman p
            WHERE p.id = ?
            AND p.id_user = ?
            LIMIT 1
          `;

          db.promise()
            .query(checkSql, [extend_order_id, userId])
            .then(([rows]) => {
              const order = rows && rows[0];

              if (!order) {
                req.session.message = {
                  type: "warning",
                  text: "Peminjaman tidak ditemukan.",
                };
                return res.redirect(`/order-detail/${extend_order_id}`);
              }

              if (
                String(order.status).toLowerCase() !== "in use" ||
                Number(order.pending_extend) > 0
              ) {
                req.session.message = {
                  type: "warning",
                  text: "Perpanjangan hanya dapat diajukan setelah barang disetujui dan sedang dipinjam.",
                };
                return res.redirect(`/order-detail/${extend_order_id}`);
              }

              saveDraft();
            })
            .catch((errCheck) => {
              console.error(errCheck);
              req.session.message = {
                type: "error",
                text: "Terjadi kesalahan.",
              };
              return res.redirect(`/order-detail/${extend_order_id}`);
            });
        } else {
          saveDraft();
        }
      });
    } else {
      return res.status(400).send("Aksi tidak valid.");
    }
  },
};
