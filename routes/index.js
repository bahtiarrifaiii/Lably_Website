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
const Order = require("../models/orderModel");

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
  const { action_type, quantity, product_id, borrow_date, return_date, all_total, all_total_raw, phone, address } = req.body;

  // helper to parse formatted currency like "Rp1.234.000" or "1234000" into number
  function parseCurrency(value) {
    if (value == null) return null;
    if (typeof value === "number") return value;
    // Prefer raw numeric value if available
    if (all_total_raw && !isNaN(all_total_raw)) {
      return Number(all_total_raw);
    }
    // Otherwise parse formatted string: remove "Rp" prefix and spaces, keep only digits
    const cleaned = String(value).replace(/[^\d]/g, "");
    if (cleaned === "") return null;
    return Number(cleaned);
  }

  const allTotalNumber = parseCurrency(all_total);

  if (action_type === "cart") {
    // Tambahkan item ke session cart, lalu redirect ke halaman /cart
    req.session.cart = req.session.cart || [];

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

      req.session.cart.push({
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: Number(quantity) || 1,
        borrow_date: borrow_date || null,
        return_date: return_date || null,
        all_total: allTotalNumber,
        all_total_raw: all_total || null,
        phone: phone || "",
        address: address || "",
      });

      console.log("Produk ditambahkan ke Keranjang:", product.name);
      return res.redirect("/cart");
    });
  } else if (action_type === "loan") {
    // Simpan sementara data checkout di session lalu redirect ke /checkout
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

      req.session.checkout = {
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: Number(quantity) || 1,
        borrow_date: borrow_date || null,
        return_date: return_date || null,
        all_total: allTotalNumber,
        all_total_raw: all_total || null,
        phone: phone || "",
        address: address || "",
      };

      console.log("Langsung ke proses Peminjaman:", product.name);
      return res.redirect("/checkout");
    });
  } else {
    res.status(400).send("Aksi tidak valid.");
  }
});

/* ============================================
  PAGES (LOGIN REQUIRED)
============================================ */

// CART PAGE
router.get("/cart", isLoggedIn, passLoginStatus, async (req, res) => {
  const cartItems = req.session.cart || [];

  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/user/cart.ejs"),
    { cartItems }
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

// Remove a single item from cart (by product_id)
router.post("/cart/remove", isLoggedIn, (req, res) => {
  const { product_id } = req.body;
  if (!req.session.cart || !Array.isArray(req.session.cart)) {
    return res.redirect("/cart");
  }

  // Remove all items matching product_id
  req.session.cart = req.session.cart.filter(
    (item) => String(item.product_id) !== String(product_id)
  );

  req.session.message = { type: "success", text: "Item removed from cart." };
  return res.redirect("/cart");
});

// Clear entire cart
router.post("/cart/clear", isLoggedIn, (req, res) => {
  req.session.cart = [];
  req.session.message = { type: "success", text: "Cart cleared." };
  return res.redirect("/cart");
});

// CHECKOUT PAGE
router.get("/checkout", isLoggedIn, passLoginStatus, async (req, res) => {
  // Build checkout items from either single-item checkout (loan now) or session cart
  const sessionCheckout = req.session.checkout || null;
  const sessionCart = req.session.cart || [];

  // choose source: prefer sessionCheckout (single loan-now), otherwise use cart
  const sourceItems = sessionCheckout ? [sessionCheckout] : sessionCart;

  function computeDays(borrow, ret) {
    try {
      if (!borrow || !ret) return 1;
      const a = new Date(borrow);
      const b = new Date(ret);
      const diffMs = b - a;
      const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 1;
    } catch (e) {
      return 1;
    }
  }

  const items = (sourceItems || []).map((it) => {
    const price = Number(it.price) || 0;
    const qty = Number(it.quantity) || 1;
    const days = computeDays(it.borrow_date, it.return_date);
    const itemTotal = Number(it.all_total) || price * qty * days;
    return {
      product_id: it.product_id,
      name: it.name,
      price,
      quantity: qty,
      borrow_date: it.borrow_date || null,
      return_date: it.return_date || null,
      days,
      itemTotal,
    };
  });

  const subtotal = items.reduce((s, it) => s + (it.itemTotal || 0), 0);

  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/user/checkout.ejs"),
    { items, subtotal }
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

// Cancel checkout (clear session.checkout) and redirect back
router.post("/checkout/cancel", isLoggedIn, (req, res) => {
  req.session.checkout = null;
  req.session.message = { type: "info", text: "Checkout cancelled." };
  return res.redirect("/catalogue");
});


// Finalize checkout: create peminjaman rows for the logged-in user
router.post("/checkout/complete", isLoggedIn, (req, res) => {
  const userId = req.session.user && req.session.user.id;
  if (!userId) {
    req.session.message = { type: "error", text: "User session tidak valid." };
    return res.redirect("/login");
  }

  const sessionCheckout = req.session.checkout || null;
  const sessionCart = req.session.cart || [];
  const sourceItems = sessionCheckout ? [sessionCheckout] : sessionCart;

  if (!sourceItems || sourceItems.length === 0) {
    req.session.message = { type: "error", text: "Tidak ada item untuk checkout." };
    return res.redirect("/cart");
  }

  // prepare items for insertion
  const itemsToInsert = sourceItems.map((it) => {
    return {
      product_id: it.product_id,
      quantity: Number(it.quantity) || 1,
      borrow_date: it.borrow_date || null,
      return_date: it.return_date || null,
      // prefer itemTotal, then all_total, then price
      itemTotal: it.itemTotal || it.all_total || null,
      price: it.price || null,
      // use phone/address from session item (set during form submission)
      phone: it.phone || "",
      address: it.address || "",
    };
  });

  Order.createOrders(userId, itemsToInsert, (err, result) => {
    if (err) {
      console.error("ERROR creating orders:", err);
      req.session.message = { type: "error", text: "Gagal menyimpan pesanan." };
      return res.redirect("/checkout");
    }

    // clear checkout/cart
    req.session.checkout = null;
    req.session.cart = [];

    req.session.message = { type: "success", text: "Checkout berhasil. Pesanan disimpan." };
    return res.redirect("/order-user");
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
