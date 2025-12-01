// routes/index.js
const express = require("express");
const router = express.Router();
const ejs = require("ejs");
const path = require("path");
const multer = require("multer");
const Product = require("../models/productModel");
const db = require("../config/database");

// Models
const User = require("../models/userModel");
const Customer = require("../models/customerModel");

// Controllers
const authController = require("../controllers/authController");
const categoryController = require("../controllers/categoryController");
const customerController = require("../controllers/customerController");
const productController = require("../controllers/productController");

// Middleware
const {
  isLoggedIn,
  isAdmin,
  passLoginStatus,
} = require("../middlewares/authMiddleware");

/* ============================================
    KONFIGURASI MIDDLEWARE UPLOAD (MULTER)
============================================ */

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./public/uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* ============================================
   AUTH PAGE (PUBLIC ACCESS)
============================================ */

// ROUTE LOGIN
router.get("/login", async (req, res) => {
  const message = req.session.message || null;
  req.session.message = null;

  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/auth/login.ejs"),
    { message }
  );

  res.render("layouts/auth", {
    title: "Login | Lably",
    meta: "",
    style: "",
    content,
  });
});
router.post("/login", authController.login);

// ROUTE REGISTER
router.get("/register", async (req, res) => {
  const message = req.session.message || null;
  req.session.message = null;

  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/auth/register.ejs"),
    { message }
  );

  res.render("layouts/auth", {
    title: "Register | Lably",
    meta: "",
    style: "",
    content,
  });
});
router.post("/register", authController.register);

// ROUTE LOGOUT
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

/* ============================================
   USER PAGE (PUBLIC ACCESS)
============================================ */

// ROUTE HOME
router.get("/", passLoginStatus, async (req, res) => {
  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/user/home.ejs")
  );

  res.render("layouts/main", {
    title: "Home | Lably Official Web",
    currentPage: "home",
    showFooter: true,
    meta: `
      <meta name="description" content="LabLy: Solusi alat riset dan laboratorium." />
      <meta name="keywords" content="LabLy, alat riset, laboratorium" />
    `,
    style: `<link rel="stylesheet" href="/CSS/home.css" />`,
    content,
  });
});

// ROUTE CATALOGUE
router.get("/catalogue", (req, res) => {
  const page = parseInt(req.query.page) || 1; // default page 1
  const limit = 9; // 9 produk per halaman
  const offset = (page - 1) * limit;

  const search = req.query.search || ""; // kalau nanti mau tambahin search server-side

  // Ambil data produk (paginated)
  Product.getPaginated(search, limit, offset, (err, products) => {
    if (err) return res.status(500).send("Error fetching products");

    // Hitung total produk untuk pagination
    Product.count(search, (err2, result) => {
      if (err2) return res.status(500).send("Error counting products");

      const totalProducts = result[0].total;
      const totalPages = Math.ceil(totalProducts / limit);

      // Ambil kategori
      db.query("SELECT * FROM category", (err3, categories) => {
        if (err3) return res.status(500).send("Error fetching categories");

        ejs.renderFile(
          path.join(__dirname, "../views/pages/user/catalogue.ejs"),
          {
            products,
            categories,
            currentPage: page,
            totalPages,
          },
          (err4, content) => {
            if (err4) {
              console.log("EJS ERROR:", err4);
              return res.status(500).send("EJS render error");
            }

            res.render("layouts/main", {
              title: "Catalogue | Lably Official Web",
              currentPage: "catalogue",
              showFooter: true,
              meta: `
                <meta name="description" content="Katalog alat laboratorium LabLy." />
                <meta name="keywords" content="LabLy, alat riset, laboratorium" />
              `,
              style: `<link rel="stylesheet" href="/CSS/catalogue.css" />`,
              content,
            });
          }
        );
      });
    });
  });
});

// ROUTE PRODUCT
router.get("/product/:id", isLoggedIn, passLoginStatus, (req, res) => {
  const productId = req.params.id;

  const sql = `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN category c ON p.id_category = c.id
    WHERE p.id = ?
  `;

  db.query(sql, [productId], async (err, results) => {
    if (err) throw err;
    if (results.length === 0) return res.redirect("/catalogue");

    const product = results[0];

    const content = await ejs.renderFile(
      path.join(__dirname, "../views/pages/user/product.ejs"),
      { product }
    );

    res.render("layouts/main", {
      title: `${product.name} | Lably Web`,
      currentPage: "product",
      showFooter: true,
      meta: `
        <meta name="description" content="${product.name}"/>
      `,
      style: `<link rel="stylesheet" href="/CSS/product.css" />`,
      content,
    });
  });
});

// ROUTE FORM
router.get("/form", isLoggedIn, passLoginStatus, async (req, res) => {
  const formSpecificScript = "/JS/form-user.js";
  const message = req.session.message || null;
  req.session.message = null;

  const productId = req.query.product_id;
  const qty = parseInt(req.query.qty) || 1;
  const action = req.query.action;

  if (!productId) {
    req.session.message = "ID Produk tidak ditemukan.";
    return res.redirect("/catalogue");
  }

  if (!action) {
    req.session.message = "Aksi pemesanan tidak valid.";
    return res.redirect("/catalogue");
  }

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

    User.getById(req.session.user.id, (err, userRows) => {
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

      ejs.renderFile(
        path.join(__dirname, "../views/pages/user/form.ejs"),
        {
          message,
          product,
          qty,
          priceTotal,
          user,
          action,
        },
        (err, content) => {
          if (err) {
            console.error("EJS Render Error:", err);
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
        }
      );
    });
  });
});

router.post("/submit-data", isLoggedIn, (req, res) => {
  const { action_type, quantity } = req.body;

  if (action_type === "cart") {
    console.log("Produk ditambahkan ke Keranjang");
    res.redirect("/cart");
  } else if (action_type === "loan") {
    console.log("Langsung ke proses Peminjaman");
    res.redirect("/checkout");
  } else {
    res.status(400).send("Aksi tidak valid.");
  }
});

/* ============================================
  PAGES (LOGIN REQUIRED)
============================================ */

// CART PAGE
router.get("/cart", isLoggedIn, passLoginStatus, async (req, res) => {
  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/user/cart.ejs")
  );

  res.render("layouts/main", {
    title: "Cart | Lably",
    currentPage: "cart",
    showFooter: false,
    meta: `
      <meta name="description" content="Keranjang menyimpan alat laboratorium LabLy." />
      <meta name="keywords" content="LabLy, alat riset, laboratorium" />
    `,
    style: `<link rel="stylesheet" href="/CSS/cart.css" />`,
    content,
  });
});

// CHECKOUT PAGE
router.get("/checkout", isLoggedIn, passLoginStatus, async (req, res) => {
  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/user/checkout.ejs")
  );

  res.render("layouts/main", {
    title: "Checkout | Lably",
    currentPage: "checkout",
    showFooter: false,
    meta: `
      <meta name="description" content="Bayar untuk peminjaman alat laboratorium LabLy." />
      <meta name="keywords" content="LabLy, alat riset, laboratorium" />
    `,
    style: `<link rel="stylesheet" href="/CSS/checkout.css" />`,
    content,
  });
});

// ORDER PAGE
router.get("/order-user", isLoggedIn, passLoginStatus, async (req, res) => {
  const orderSpecificScript = "/JS/user/order-user.js";

  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/user/order-user.ejs"),
    {}
  );

  res.render("layouts/main", {
    title: "Order | Lably Official Web",
    currentPage: "order-user",
    showFooter: false,

    meta: `
      <meta name="description" content="List Order alat laboratorium LabLy." />
      <meta name="keywords" content="LabLy, alat riset, laboratorium" />
    `,

    style: `
      <link rel="stylesheet" href="/CSS/order-user.css" />
    `,

    scriptFile: orderSpecificScript,

    content,
  });
});

/* ============================================
   ADMIN PAGE
============================================ */

router.get("/dashboard", isAdmin, authController.dashboard);

// CUSTOMERS PAGE
router.get("/customer", isAdmin, (req, res) => {
  // if (!req.session.admin) return res.redirect("/login");
  return customerController.list(req, res);
});

/* ORDER PAGES (tidak diubah) */
router.get("/order", isAdmin, (req, res) => {
  // if (!req.session.admin) return res.redirect("/login");

  User.getAll((err, users) => {
    const totalCustomers = users.length;

    ejs.renderFile(
      path.join(__dirname, "../views/pages/admin/order/order.ejs"),
      { users, totalCustomers },
      (err, content) => {
        res.render("layouts/atmin", {
          title: "Orders | Lably",
          style: `<link rel="stylesheet" href="/css/order.css">`,
          content,
          message: null,
          showPopup: false,
          currentPage: req.path,
        });
      }
    );
  });
});

router.get("/order-completed", isAdmin, (req, res) => {
  // if (!req.session.admin) return res.redirect("/login");

  User.getAll((err, users) => {
    const totalCustomers = users.length;

    ejs.renderFile(
      path.join(__dirname, "../views/pages/admin/order/order_completed.ejs"),
      { users, totalCustomers },
      (err, content) => {
        res.render("layouts/atmin", {
          title: "Orders Completed",
          style: `<link rel="stylesheet" href="/css/order_completed.css">`,
          content,
          message: null,
          showPopup: false,
          currentPage: req.path,
        });
      }
    );
  });
});

/* ============================================
   PRODUCT ADMIN — CLEAN & FIXED
============================================ */

// LIST
router.get("/product-list", isAdmin, productController.list);

// CREATE PAGE
router.get("/product-create", isAdmin, productController.createPage);

// CREATE ACTION
router.post(
  "/product/create",
  isAdmin,
  upload.single("image"),
  productController.create
);

// DETAIL PAGE
router.get("/product-detail/:id", isAdmin, productController.detailPage);

// UPDATE ACTION
router.post(
  "/product/update/:id",
  isAdmin,
  upload.single("image"),
  productController.update
);

// DELETE
router.get("/product/delete/:id", isAdmin, productController.delete);

/* ============================================
   ANALYTICS / INVOICE (tidak diubah)
============================================ */

router.get("/analytics", isAdmin, (req, res) => {
  // if (!req.session.admin) return res.redirect("/login");

  User.getAll((err, users) => {
    const totalCustomers = users.length;

    ejs.renderFile(
      path.join(__dirname, "../views/pages/admin/analytics.ejs"),
      { users, totalCustomers },
      (err, content) => {
        res.render("layouts/atmin", {
          title: "Analytics",
          style: `<link rel="stylesheet" href="/css/analytics.css">`,
          content,
          showPopup: false,
          message: null,
          currentPage: req.path,
        });
      }
    );
  });
});

router.get("/invoice", isAdmin, (req, res) => {
  // if (!req.session.admin) return res.redirect("/login");

  User.getAll((err, users) => {
    const totalCustomers = users.length;

    ejs.renderFile(
      path.join(__dirname, "../views/pages/admin/invoice.ejs"),
      { users, totalCustomers },
      (err, content) => {
        res.render("layouts/atmin", {
          title: "Invoice",
          style: `<link rel="stylesheet" href="/css/invoice.css">`,
          content,
          showPopup: false,
          message: null,
          currentPage: req.path,
        });
      }
    );
  });
});

/* ============================================
   CATEGORY
============================================ */

router.get("/category", isAdmin, categoryController.index);
router.get("/category/create", isAdmin, categoryController.createPage);
router.post("/category/create", isAdmin, categoryController.create);
router.get("/category/edit/:id", isAdmin, categoryController.editPage);
router.post("/category/update/:id", isAdmin, categoryController.update);
router.get("/category/delete/:id", isAdmin, categoryController.delete);

module.exports = router;
