const path = require("path");
const ejs = require("ejs");
const db = require("../../config/database");
const Draft = require("../../models/draftModel");
const User = require("../../models/userModel");
const Order = require("../../models/orderModel");
const Payment = require("../../models/paymentModel");
const { computeDays } = require("../../utils/dateAndCurrency");

module.exports = {
  cartPage: async (req, res) => {
    const userId = req.session.user && req.session.user.id;

    Draft.getByUser(userId, async (err, rows) => {
      if (err) {
        console.error("Error get draft cart:", err);
        return res.status(500).send("Error loading cart.");
      }

      const cartItems = (rows || []).map((r) => ({
        product_id: r.id_products,
        name: r.product_name || "Produk",
        price: Number(r.price) || 0,
        image: r.product_image
          ? `/uploads/${r.product_image}`
          : "/assets/default.png",
        quantity: Number(r.qty) || 1,
        borrow_date: r.tgl_pinjam ? String(r.tgl_pinjam).slice(0, 10) : null,
        return_date: r.tgl_kembali ? String(r.tgl_kembali).slice(0, 10) : null,
        all_total: null,
        all_total_raw: null,
      }));

      const content = await ejs.renderFile(
        path.join(__dirname, "../../views/pages/user/cart.ejs"),
        { cartItems },
      );

      res.render("layouts/main", {
        title: "Cart | Lably",
        currentPage: "cart",
        showFooter: false,
        meta: `
          <meta name="description" content="Keranjang menyimpan alat laboratorium LabLy." />
          <meta name="keywords" content="LabLy, alat riset, laboratorium" />
        `,
        style: `<link rel="stylesheet" href="/css/user/cart.css" />`,
        content,
      });
    });
  },

  removeFromCart: (req, res) => {
    const { product_id } = req.body;
    const userId = req.session.user && req.session.user.id;

    if (!userId || !product_id) {
      return res.redirect("/cart");
    }

    const sql = `
      DELETE FROM d_peminjaman
      WHERE id_user = ? AND id_products = ?
      LIMIT 1
    `;
    db.query(sql, [userId, product_id], (err) => {
      if (err) {
        console.error("Gagal hapus draft cart:", err);
      }
      return res.redirect("/cart");
    });
  },

  clearCart: (req, res) => {
    const userId = req.session.user && req.session.user.id;

    Draft.deleteByUser(userId, (err) => {
      if (err) {
        console.error("Gagal clear draft cart:", err);
      }
      return res.redirect("/cart");
    });
  },

  checkoutPage: async (req, res) => {
    const userId = req.session.user && req.session.user.id;

    Draft.getByUser(userId, async (err, rows) => {
      if (err) {
        console.error("Error get draft for checkout:", err);
        return res.status(500).send("Error loading checkout.");
      }

      const items = (rows || []).map((r) => {
        const price = Number(r.price) || 0;
        const qty = Number(r.qty) || 1;
        const days = computeDays(r.tgl_pinjam, r.tgl_kembali);
        const itemTotal = price * qty * days;

        return {
          product_id: r.id_products,
          name: r.product_name || "Produk",
          image: r.product_image
            ? `/uploads/${r.product_image}`
            : "/assets/default.png",
          price,
          quantity: qty,
          borrow_date: r.tgl_pinjam ? String(r.tgl_pinjam).slice(0, 10) : null,
          return_date: r.tgl_kembali
            ? String(r.tgl_kembali).slice(0, 10)
            : null,
          days,
          itemTotal,
        };
      });

      const subtotal = items.reduce((s, it) => s + (it.itemTotal || 0), 0);
      const invoiceNumber =
        "INV-LABLY-" +
        Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(6, "0");

      User.getById(userId, async (userErr, userRows) => {
        const user = !userErr && userRows.length ? userRows[0] : null;
        const content = await ejs.renderFile(
          path.join(__dirname, "../../views/pages/user/checkout.ejs"),
          { items, subtotal, invoiceNumber, user },
        );

        res.render("layouts/main", {
          title: "Checkout | Lably",
          currentPage: "checkout",
          showFooter: false,
          meta: `
            <meta name="description" content="Bayar untuk peminjaman alat laboratorium LabLy." />
            <meta name="keywords" content="LabLy, alat riset, laboratorium" />
          `,
          style: `
            <link rel="stylesheet" href="/css/user/checkout.css" />
            <link rel="stylesheet" href="/css/user/e-wallet.css" />
            <link rel="stylesheet" href="/css/user/e-wallet-qr.css" />
            <link rel="stylesheet" href="/css/user/qris.css" />
            <link rel="stylesheet" href="/css/user/card.css" />
          `,
          content,
          user,
        });
      });
    });
  },

  qrisPage: async (req, res) => {
    try {
      const content = await ejs.renderFile(
        path.join(__dirname, "../../views/pages/user/payment/qris.ejs"),
        {},
      );

      return res.render("layouts/main", {
        title: "QRIS Payment | Lably",
        currentPage: "payment",
        showFooter: false,
        meta: `<meta name="description" content="QRIS payment preview" />`,
        style: `<link rel="stylesheet" href="/css/user/qris.css" />`,
        content,
      });
    } catch (err) {
      console.error("Error rendering QRIS page:", err);
      return res.status(500).send("Error rendering QRIS page.");
    }
  },

  cancelCheckout: (req, res) => {
    req.session.message = { type: "info", text: "Checkout cancelled." };
    return res.redirect("/catalogue");
  },

  completeCheckout: (req, res) => {
    const userId = req.session.user && req.session.user.id;
    if (!userId) {
      req.session.message = {
        type: "error",
        text: "User session tidak valid.",
      };
      return res.redirect("/login");
    }

    Draft.getByUser(userId, (err, rows) => {
      if (err) {
        console.error("ERROR get draft for complete:", err);
        req.session.message = {
          type: "error",
          text: "Gagal memproses checkout.",
        };
        return res.redirect("/checkout");
      }

      if (!rows || rows.length === 0) {
        req.session.message = {
          type: "error",
          text: "Tidak ada item untuk checkout.",
        };
        return res.redirect("/cart");
      }

      const itemsToInsert = rows.map((r) => {
        const priceUnit = Number(r.price) || 0;
        const qty = Number(r.qty) || 1;
        const days = computeDays(r.tgl_pinjam, r.tgl_kembali);
        const itemTotal = priceUnit * qty * days;

        return {
          product_id: r.id_products,
          quantity: qty,
          borrow_date: r.tgl_pinjam ? String(r.tgl_pinjam).slice(0, 10) : null,
          return_date: r.tgl_kembali
            ? String(r.tgl_kembali).slice(0, 10)
            : null,
          itemTotal,
          price: priceUnit,
          phone: r.no_telp || "",
          address: r.alamat || "",
          extend_from: r.extend_from || null,
        };
      });

      const paymentMethod = req.body.payment_method || "Unknown";
      const ewalletProvider = req.body.ewallet_provider || null;
      const newLoanItems = itemsToInsert.filter((item) => !item.extend_from);
      const extensionItems = itemsToInsert.filter((item) => item.extend_from);

      const processExtensionUpdates = (callback) => {
        if (!extensionItems.length) return callback(null);

        let pending = extensionItems.length;

        extensionItems.forEach((item) => {
          const returnDate = item.return_date
            ? String(item.return_date).slice(0, 10)
            : null;
          const orderId = Number(item.extend_from);

          db.query(
            "SELECT id, price, tgl_pinjam, tgl_kembali, qty FROM peminjaman WHERE id = ? AND id_user = ? LIMIT 1",
            [orderId, userId],
            (orderErr, orderRows) => {
              if (orderErr) {
                console.error(
                  "ERROR fetching original order for extension:",
                  orderErr,
                );
                return callback(orderErr);
              }

              const originalOrder = orderRows && orderRows[0];
              const qty = Number(originalOrder?.qty) || 1;
              const unitPrice = Number(item.price);
              const totalDays = computeDays(
                originalOrder.tgl_pinjam,
                returnDate,
              );
              const priceValue = String(unitPrice * qty * totalDays);

              db.query(
                "UPDATE peminjaman SET original_tgl_kembali = COALESCE(original_tgl_kembali, tgl_kembali), original_price = COALESCE(original_price, price), tgl_kembali = ?, price = ?, status = 'waiting' WHERE id = ? AND id_user = ?",
                [returnDate, priceValue, orderId, userId],
                (updateErr) => {
                  if (updateErr) {
                    console.error("ERROR updating extension request:", updateErr);
                    return callback(updateErr);
                  }

                  pending -= 1;
                  if (pending === 0) callback(null);
                },
              );
            },
          );
        });
      };

      processExtensionUpdates((extErr) => {
        if (extErr) {
          req.session.message = {
            type: "error",
            text: "Gagal mengajukan perpanjangan durasi.",
          };
          return res.redirect("/checkout");
        }

        Order.createOrders(userId, newLoanItems, (err2) => {
          if (err2) {
            console.error("ERROR creating orders:", err2);
            req.session.message = {
              type: "error",
              text: "Gagal menyimpan pesanan.",
            };
            return res.redirect("/checkout");
          }

          const updateStockPromises = newLoanItems.map((item) => {
            return new Promise((resolve, reject) => {
              const sql = `
                UPDATE products 
                SET stock = stock - ?
                WHERE id = ? AND stock >= ?
              `;
              db.query(
                sql,
                [item.quantity, item.product_id, item.quantity],
                (stockErr, result) => {
                  if (stockErr) return reject(stockErr);

                  if (result.affectedRows === 0) {
                    return reject(
                      new Error(
                        "Stok tidak mencukupi untuk produk ID " +
                          item.product_id,
                      ),
                    );
                  }

                  resolve();
                },
              );
            });
          });

          Promise.all(updateStockPromises)
            .then(() => {
              Payment.createPayments(
                userId,
                paymentMethod,
                ewalletProvider,
                newLoanItems,
                (errPayment) => {
                  if (errPayment) {
                    console.error("ERROR saving payment records:", errPayment);
                    req.session.message = {
                      type: "error",
                      text: "Gagal menyimpan data pembayaran.",
                    };
                    return res.redirect("/checkout");
                  }

                  Draft.deleteByUser(userId, (errDel) => {
                    if (errDel) {
                      console.error(
                        "Gagal menghapus draft setelah checkout:",
                        errDel,
                      );
                    }

                    req.session.message = {
                      type: "success",
                      text: "Checkout berhasil. Pesanan disimpan.",
                    };
                    return res.redirect("/notif-checkout");
                  });
                },
              );
            })
            .catch((errStock) => {
              console.error("STOCK ERROR:", errStock);
              req.session.message = {
                type: "error",
                text: "Checkout gagal: stok salah satu produk sudah habis.",
              };
              return res.redirect("/cart");
            });
        });
      });
    });
  },

  notifCheckout: async (req, res) => {
    try {
      const content = await ejs.renderFile(
        path.join(__dirname, "../../views/pages/user/notif-checkout.ejs"),
        {},
      );

      return res.render("layouts/main", {
        title: "Payment Success | Lably",
        currentPage: "notif-checkout",
        showFooter: false,
        showHeader: false,
        meta: `
          <meta name="description" content="Notifikasi Checkout laboratorium LabLy." />
          <meta name="keywords" content="LabLy, alat riset, laboratorium" />
        `,
        style: `<link rel="stylesheet" href="/css/user/notif-checkout.css" />`,
        content,
      });
    } catch (err) {
      console.error("Error rendering notif-checkout:", err);
      return res.redirect("/order-user");
    }
  },

  previewEwallet: async (req, res) => {
    try {
      const subtotal = req.query.subtotal ? Number(req.query.subtotal) : 10000;
      const invoiceNumber = req.query.invoiceNumber || "INV-DEV-000001";

      const content = await ejs.renderFile(
        path.join(__dirname, "../../views/pages/user/payment/e-wallet.ejs"),
        { subtotal, invoiceNumber },
      );

      return res.render("layouts/main", {
        title: "E-Wallet Preview | Lably",
        currentPage: "preview-ewallet",
        showFooter: false,
        meta: "",
        style: `<link rel="stylesheet" href="/css/user/e-wallet.css" />`,
        content,
      });
    } catch (err) {
      console.error("Error rendering e-wallet preview:", err);
      return res.status(500).send("Error rendering e-wallet preview.");
    }
  },

  previewEwalletQr: async (req, res) => {
    try {
      const subtotal = req.query.subtotal ? Number(req.query.subtotal) : 10000;
      const invoiceNumber = req.query.invoiceNumber || "INV-DEV-000001";

      const content = await ejs.renderFile(
        path.join(__dirname, "../../views/pages/user/payment/e-wallet-qr.ejs"),
        { subtotal, invoiceNumber },
      );

      return res.render("layouts/main", {
        title: "E-Wallet QR Preview | Lably",
        currentPage: "preview-ewallet-qr",
        showFooter: false,
        meta: "",
        style: `<link rel="stylesheet" href="/css/user/e-wallet-qr.css" />`,
        content,
      });
    } catch (err) {
      console.error("Error rendering e-wallet-qr preview:", err);
      return res.status(500).send("Error rendering e-wallet-qr preview.");
    }
  },
};
