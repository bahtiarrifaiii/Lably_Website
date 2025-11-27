// routes/index.js
const express = require("express");
const router = express.Router();
const ejs = require("ejs");
const path = require("path");
const multer = require("multer");

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

// LOGIN PAGE
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

// REGISTER PAGE
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

// LOGOUT
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

/* ============================================
   USER PAGE (PUBLIC ACCESS)
============================================ */

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

router.get("/catalogue", passLoginStatus, async (req, res) => {
  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/user/catalogue.ejs")
  );

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
});

router.get("/product", isLoggedIn, passLoginStatus, async (req, res) => {
  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/user/product.ejs")
  );

  res.render("layouts/main", {
    title: "Product | Lably Official Web",
    currentPage: "product",
    showFooter: true,
    meta: `
      <meta name="description" content="Produk alat laboratorium LabLy." />
      <meta name="keywords" content="LabLy, alat riset, laboratorium" />
    `,
    style: `<link rel="stylesheet" href="/CSS/product.css" />`,
    content,
  });
});

router.get("/form", isLoggedIn, passLoginStatus, async (req, res) => {
  const message = req.session.message || null;
  req.session.message = null;

  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/user/form.ejs"),
    { message }
  );

  res.render("layouts/forms", {
    title: "Form | Lably",
    meta: `
      <meta name="description" content="Form peminjaman alat laboratorium LabLy." />
      <meta name="keywords" content="LabLy, alat riset, laboratorium" />
    `,
    style: "",
    content,
  });
});

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
  const orderSpecificScript = "/JS/order-user.js";

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
