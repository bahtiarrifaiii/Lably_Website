const path = require("path");
const ejs = require("ejs");
const bcrypt = require("bcrypt");
const db = require("../../config/database");
const User = require("../../models/userModel");

module.exports = {
  ordersPage: async (req, res) => {
    const orderSpecificScript = "/js/user/order-user.js";
    const userId = req.session.user.id;

    const sql = `
      SELECT 
        p.id,
        p.id_products,
        p.qty,
        p.price,
        p.status,
        DATE_FORMAT(p.tgl_pinjam, '%Y-%m-%d') AS tgl_pinjam,
        DATE_FORMAT(p.tgl_kembali, '%Y-%m-%d') AS tgl_kembali,
        pr.name AS product_name,
        pr.image AS product_image,
        pr.price AS product_price,
        r.reminder_id AS reminder_id
      FROM peminjaman p
      LEFT JOIN products pr ON p.id_products = pr.id
      LEFT JOIN (
        SELECT id_peminjaman, MAX(id) AS reminder_id
        FROM reminder
        GROUP BY id_peminjaman
      ) r ON r.id_peminjaman = p.id
      WHERE p.id_user = ?
      AND NOT (
        p.extend_from IS NOT NULL
        AND p.status = 'pending'
      )
      ORDER BY p.id DESC
    `;

    db.query(sql, [userId], async (err, orders) => {
      if (err) {
        console.error("ORDER LOAD ERROR:", err);
        return res.status(500).send("Error loading orders.");
      }

      User.getById(userId, async (userErr, userRows) => {
        if (userErr || !userRows.length) {
          return res.status(500).send("Error loading user.");
        }
        const user = userRows[0];

        const content = await ejs.renderFile(
          path.join(__dirname, "../../views/pages/user/profile/order.ejs"),
          { orders, user },
        );

        res.render("layouts/profile", {
          title: "My Orders | Lably",
          style: `
            <link rel="stylesheet" href="/css/user/dashboard-profile.css" />
            <link rel="stylesheet" href="/css/user/order-user.css" />
          `,
          scriptFile: orderSpecificScript,
          content,
          currentPage: req.path,
          user,
        });
      });
    });
  },

  orderDetailPage: async (req, res) => {
    const orderId = req.params.id;
    const userId = req.session.user.id;

    const sql = `
      SELECT
        p.id,
        p.id_products,
        p.qty,
        p.price,
        p.status,
        DATE_FORMAT(p.tgl_pinjam, '%Y-%m-%d') AS tgl_pinjam,
        DATE_FORMAT(p.tgl_kembali, '%Y-%m-%d') AS tgl_kembali,
        pr.name AS product_name,
        pr.image AS product_image,
        pr.kondisi,
        pr.price AS product_price,
        c.name AS category_name,
        u.username,
        u.email,
        u.phone,
        u.address,
        pmt.metode_payment AS payment_method,
        pmt.ewallet_provider,
        (
          SELECT COUNT(*)
          FROM peminjaman x
          WHERE x.extend_from = p.id
          AND x.status = 'pending'
        ) AS pending_extend
      FROM peminjaman p
      LEFT JOIN products pr ON p.id_products = pr.id
      LEFT JOIN category c ON pr.id_category = c.id
      LEFT JOIN users u ON p.id_user = u.id
      LEFT JOIN payment pmt
        ON p.id_user = pmt.id_user
        AND p.id_products = pmt.id_product
        AND p.tgl_pinjam = pmt.tgl_pinjam
        AND p.tgl_kembali = pmt.tgl_kembali
      WHERE p.id = ?
      AND p.id_user = ?
    `;

    db.query(sql, [orderId, userId], async (err, results) => {
      if (err) {
        console.error("ORDER DETAIL LOAD ERROR:", err);
        return res.status(500).send("Error loading order detail.");
      }

      if (results.length === 0) return res.status(404).send("Order not found.");

      const order = results[0];

      User.getById(userId, async (userErr, userRows) => {
        if (userErr || !userRows.length) {
          return res.status(500).send("Error loading user.");
        }
        const user = userRows[0];

        const content = await ejs.renderFile(
          path.join(
            __dirname,
            "../../views/pages/user/profile/order-detail.ejs",
          ),
          { order, user },
        );

        res.render("layouts/profile", {
          title: "Order Detail | Lably",
          style: `<link rel="stylesheet" href="/css/user/order-detail.css" />`,
          content,
          currentPage: "/order-user",
          user,
        });
      });
    });
  },

  receiptPage: async (req, res) => {
    const orderId = req.params.id;
    const userId = req.session.user.id;

    const sql = `
      SELECT
        p.id,
        p.id_products,
        p.qty,
        p.price,
        p.status,
        DATE_FORMAT(p.tgl_pinjam, '%Y-%m-%d') AS tgl_pinjam,
        DATE_FORMAT(p.tgl_kembali, '%Y-%m-%d') AS tgl_kembali,
        pr.name AS product_name,
        pr.image AS product_image,
        pr.price AS product_price,
        u.username,
        u.email,
        u.phone,
        u.address,
        pmt.metode_payment AS payment_method,
        pmt.ewallet_provider
      FROM peminjaman p
      LEFT JOIN products pr ON p.id_products = pr.id
      LEFT JOIN users u ON p.id_user = u.id
      LEFT JOIN payment pmt
        ON p.id_user = pmt.id_user
        AND p.id_products = pmt.id_product
        AND p.tgl_pinjam = pmt.tgl_pinjam
        AND p.tgl_kembali = pmt.tgl_kembali
      WHERE p.id = ?
      AND p.id_user = ?
      LIMIT 1
    `;

    db.query(sql, [orderId, userId], async (err, results) => {
      if (err) {
        console.error("RECEIPT LOAD ERROR:", err);
        return res.status(500).send("Error loading receipt.");
      }

      if (results.length === 0) {
        return res.status(404).send("Receipt not found.");
      }

      const order = results[0];

      User.getById(userId, async (userErr, userRows) => {
        if (userErr || !userRows.length) {
          return res.status(500).send("Error loading user.");
        }

        const user = userRows[0];

        const content = await ejs.renderFile(
          path.join(__dirname, "../../views/pages/user/profile/receipt.ejs"),
          { order, user },
        );

        res.render("layouts/profile", {
          title: "Payment Receipt | LabLy",
          currentPage: "/order-user",
          user,
          style: `
            <link rel="stylesheet" href="/css/user/dashboard-profile.css">
            <link rel="stylesheet" href="/css/user/receipt.css">
          `,
          content,
        });
      });
    });
  },

  dashboardPage: async (req, res) => {
    const userId = req.session.user.id;

    User.getById(userId, async (err, userRows) => {
      if (err) {
        console.error("Database Error (User):", err);
        return res.status(500).send("Error loading user dashboard.");
      }

      if (!userRows || userRows.length === 0) {
        return res.status(404).send("User not found.");
      }

      const user = userRows[0];

      const sql = `
        SELECT
          p.id,
          p.id_products,
          p.status,
          DATE_FORMAT(p.tgl_pinjam,'%Y-%m-%d') AS tgl_pinjam,
          DATE_FORMAT(p.tgl_kembali,'%Y-%m-%d') AS tgl_kembali,
          pr.name AS product_name,
          pr.image AS product_image,
          c.name AS category_name,
          r.reminder_id
        FROM peminjaman p
        LEFT JOIN products pr ON p.id_products = pr.id
        LEFT JOIN category c ON pr.id_category = c.id
        LEFT JOIN (
          SELECT id_peminjaman, MAX(id) AS reminder_id
          FROM reminder
          GROUP BY id_peminjaman
        ) r ON r.id_peminjaman = p.id
        WHERE p.id_user = ?
        ORDER BY p.tgl_pinjam DESC, p.id DESC
      `;

      db.query(sql, [userId], async (orderErr, orders) => {
        if (orderErr) {
          console.error("Dashboard Order Load Error:", orderErr);
          return res.status(500).send("Error loading dashboard orders.");
        }

        const activeOrders = orders.filter(
          (o) => o.status === "in use" || o.status === "overdue",
        );
        const completedOrders = orders.filter((o) => o.status === "completed");
        const pendingOrders = orders.filter((o) => o.status === "pending");
        const uniqueProducts = new Set(
          orders
            .filter((o) => o.status !== "pending")
            .map((o) => o.id_products),
        ).size;

        const latestOrders = orders.slice(0, 3);
        const reminders = orders.filter(
          (o) => o.reminder_id && o.status !== "completed",
        );

        const content = await ejs.renderFile(
          path.join(__dirname, "../../views/pages/user/profile/dashboard.ejs"),
          {
            user,
            stats: {
              active: activeOrders.length,
              completed: completedOrders.length,
              pending: pendingOrders.length,
              uniqueProducts,
            },
            latestOrders,
            reminders,
          },
        );

        res.render("layouts/profile", {
          title: "Customer Dashboard | Lably",
          style: `<link rel="stylesheet" href="/css/user/dashboard-profile.css" />`,
          content,
          currentPage: req.path,
          user,
        });
      });
    });
  },

  profilePage: async (req, res) => {
    User.getById(req.session.user.id, async (err, userRows) => {
      if (err) {
        console.error("Database Error (User):", err);
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
      const message = req.session.message || null;
      req.session.message = null;

      const content = await ejs.renderFile(
        path.join(__dirname, "../../views/pages/user/profile/profile-page.ejs"),
        { user },
      );

      res.render("layouts/profile", {
        title: "Customer Profile | Lably",
        style: `<link rel="stylesheet" href="/css/user/profile-page.css" />`,
        content,
        message,
        showPopup: !!message,
        currentPage: req.path,
        user,
      });
    });
  },

  updateProfile: async (req, res) => {
    const { username, email, fullPhone, address } = req.body;

    User.updateProfile(
      req.session.user.id,
      { username, email, phone: fullPhone, address },
      (err) => {
        if (err) {
          console.error("Database Error:", err);
          req.session.message = "Gagal memperbarui profil.";
          return res.redirect("/profile-customer");
        }

        req.session.user.username = username;
        req.session.user.email = email;
        req.session.message = "Profil berhasil diperbarui.";
        res.redirect("/profile-customer");
      },
    );
  },

  uploadKtp: (req, res) => {
    User.getById(req.session.user.id, (err, userRows) => {
      if (err || !userRows.length) return res.redirect("/profile-customer");

      const user = userRows[0];

      if (!user.phone || user.phone.trim() === "") {
        req.session.message = {
          type: "error",
          text: "Harap lengkapi nomor telepon terlebih dahulu sebelum verifikasi KTP.",
        };
        return req.session.save(() => res.redirect("/profile-customer"));
      }

      if (!req.file) {
        req.session.message = "File tidak ditemukan.";
        return res.redirect("/profile-customer");
      }

      const ktpPath = `/uploads/${req.file.filename}`;
      User.uploadKtp(req.session.user.id, ktpPath, (uploadErr) => {
        if (uploadErr) {
          console.error("Database Error:", uploadErr);
          req.session.message = "Gagal mengirim KTP.";
          return res.redirect("/profile-customer");
        }
        req.session.message =
          "KTP berhasil dikirim, menunggu verifikasi admin.";
        res.redirect("/profile-customer");
      });
    });
  },

  changePhoto: (req, res) => {
    if (!req.file) {
      return res.redirect("/profile-customer");
    }

    const photoPath = `/uploads/${req.file.filename}`;

    User.updatePhoto(req.session.user.id, photoPath, (err) => {
      if (err) {
        console.error(err);
      }

      req.session.message = "Profile picture updated.";
      res.redirect("/profile-customer");
    });
  },

  changePassword: async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      req.session.message = {
        type: "error",
        text: "New passwords do not match.",
      };
      return res.redirect("/profile-customer");
    }

    User.getById(req.session.user.id, async (err, rows) => {
      if (err || !rows.length) {
        return res.redirect("/profile-customer");
      }

      const user = rows[0];
      const match = await bcrypt.compare(oldPassword, user.password);

      if (!match) {
        req.session.message = {
          type: "error",
          text: "Current password is incorrect.",
        };
        return res.redirect("/profile-customer");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      User.updatePassword(user.id, hashedPassword, (updateErr) => {
        if (updateErr) {
          req.session.message = {
            type: "error",
            text: "Failed to update password.",
          };
          return res.redirect("/profile-customer");
        }

        req.session.message = {
          type: "success",
          text: "Password updated successfully.",
        };
        res.redirect("/profile-customer");
      });
    });
  },

  changeEmail: async (req, res) => {
    const { currentEmail, newEmail, confirmEmail } = req.body;

    if (newEmail !== confirmEmail) {
      req.session.message = {
        type: "error",
        text: "New email addresses do not match.",
      };
      return res.redirect("/profile-customer");
    }

    User.getById(req.session.user.id, async (err, rows) => {
      if (err || !rows.length) {
        return res.redirect("/profile-customer");
      }

      const user = rows[0];

      if (
        !currentEmail ||
        currentEmail.toLowerCase() !== user.email.toLowerCase()
      ) {
        req.session.message = {
          type: "error",
          text: "Current email is incorrect.",
        };
        return res.redirect("/profile-customer");
      }

      User.findByEmail(newEmail, (findErr, existing) => {
        if (findErr) {
          req.session.message = { type: "error", text: "Database error." };
          return res.redirect("/profile-customer");
        }

        if (existing.length > 0 && existing[0].id !== user.id) {
          req.session.message = {
            type: "error",
            text: "Email is already in use by another account.",
          };
          return res.redirect("/profile-customer");
        }

        User.updateEmail(user.id, newEmail, (updateErr) => {
          if (updateErr) {
            req.session.message = {
              type: "error",
              text: "Failed to update email.",
            };
            return res.redirect("/profile-customer");
          }

          req.session.user.email = newEmail;
          req.session.message = {
            type: "success",
            text: "Email updated successfully.",
          };
          res.redirect("/profile-customer");
        });
      });
    });
  },
};
