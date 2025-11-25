// routes/index.js
const express = require("express");
const router = express.Router();
const ejs = require("ejs");
const path = require("path");
const User = require("../models/userModel");

// Controllers
const authController = require("../controllers/authController");
const categoryController = require("../controllers/categoryController");

// ==========================================================================
// AUTH PAGE
// ==========================================================================

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

// ==========================================================================
// USER PAGE
// ==========================================================================

// HOME PAGE
router.get("/", async (req, res) => {
  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/user/home.ejs"),
    {}
  );

  res.render("layouts/main", {
    title: "Home | Lably Official Web",
    currentPage: "home",
    showFooter: true,

    meta: `
      <meta name="description" content="LabLy: Solusi alat riset dan laboratorium." />
      <meta name="keywords" content="LabLy, alat riset, laboratorium" />
    `,

    style: `
      <link rel="stylesheet" href="/CSS/home.css" />
    `,

    content,
  });
});

// CATALOGUE PAGE
router.get("/catalogue", async (req, res) => {
  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/user/catalogue.ejs"),
    {}
  );

  res.render("layouts/main", {
    title: "Catalogue | Lably Official Web",
    currentPage: "catalogue",
    showFooter: true,

    meta: `
      <meta name="description" content="Katalog alat laboratorium LabLy." />
      <meta name="keywords" content="LabLy, alat riset, laboratorium" />
    `,

    style: `
      <link rel="stylesheet" href="/CSS/catalogue.css" />
    `,

    content,
  });
});

// PRODUCT PAGE
router.get("/product", async (req, res) => {
  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/user/product.ejs"),
    {}
  );

  res.render("layouts/main", {
    title: "Product | Lably Official Web",
    currentPage: "product",
    showFooter: true,

    meta: `
      <meta name="description" content="Product alat laboratorium LabLy." />
      <meta name="keywords" content="LabLy, alat riset, laboratorium" />
    `,

    style: `
      <link rel="stylesheet" href="/CSS/product.css" />
    `,

    content,
  });
});

// FORM PAGE
router.get("/form", async (req, res) => {
  const message = req.session.message || null;
  req.session.message = null;

  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/user/form.ejs"),
    { message }
  );

  res.render("layouts/forms", {
    title: "Form | Lably",
    meta: "",
    style: "",
    content,
  });
});

// CART PAGE
router.get("/cart", async (req, res) => {
  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/user/cart.ejs"),
    {}
  );

  res.render("layouts/main", {
    title: "Cart | Lably Official Web",
    currentPage: "cart",
    showFooter: false,

    meta: `
      <meta name="description" content="Keranjang alat laboratorium LabLy." />
      <meta name="keywords" content="LabLy, alat riset, laboratorium" />
    `,

    style: `
      <link rel="stylesheet" href="/CSS/cart.css" />
    `,

    content,
  });
});

// CHECKOUT PAGE
router.get("/checkout", async (req, res) => {
  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/user/checkout.ejs"),
    {}
  );

  res.render("layouts/main", {
    title: "Checkout | Lably Official Web",
    currentPage: "checkout",
    showFooter: false,

    meta: `
      <meta name="description" content="Keranjang checkout alat laboratorium LabLy." />
      <meta name="keywords" content="LabLy, alat riset, laboratorium" />
    `,

    style: `
      <link rel="stylesheet" href="/CSS/checkout.css" />
    `,

    content,
  });
});

// ==========================================================================
// ADMIN PAGE
// ==========================================================================

// DASHBOARD PAGE
router.get("/dashboard", authController.dashboard);

// CUSTOMERS PAGE
router.get("/customer", (req, res) => {
  if (!req.session.admin) return res.redirect("/login");

  User.getAll((err, users) => {
    if (err) throw err;

    const totalCustomers = users.length;

    ejs.renderFile(
      path.join(__dirname, "../views/pages/admin/customer.ejs"),
      { users, totalCustomers },
      (err, content) => {
        res.render("layouts/atmin", {
          title: "Customers | Lably",
          meta: "",
          style: `
            <link rel="stylesheet" href="/css/sidebar.css">
            <link rel="stylesheet" href="/css/customer.css">
          `,
          content,
          message: null,
          showPopup: false,
        });
      }
    );
  });
});

// ORDER PAGE
router.get("/order", (req, res) => {
  if (!req.session.admin) return res.redirect("/login");

  User.getAll((err, users) => {
    if (err) throw err;

    const totalCustomers = users.length;

    ejs.renderFile(
      path.join(__dirname, "../views/pages/admin/order/order.ejs"),
      { users, totalCustomers },
      (err, content) => {
        res.render("layouts/atmin", {
          title: "Orders | Lably",
          meta: "",
          style: `
            <link rel="stylesheet" href="/css/sidebar.css">
            <link rel="stylesheet" href="/css/order.css">
          `,
          content,
          message: null,
          showPopup: false,
        });
      }
    );
  });
});

// ORDER COMPLETED PAGE
router.get("/order-completed", (req, res) => {
  if (!req.session.admin) return res.redirect("/login");

  User.getAll((err, users) => {
    if (err) throw err;

    const totalCustomers = users.length;

    ejs.renderFile(
      path.join(__dirname, "../views/pages/admin/order/order_completed.ejs"),
      { users, totalCustomers },
      (err, content) => {
        res.render("layouts/atmin", {
          title: "Orders | Lably",
          meta: "",
          style: `
            <link rel="stylesheet" href="/css/sidebar.css">
            <link rel="stylesheet" href="/css/order_completed.css">
          `,
          content,
          message: null,
          showPopup: false,
        });
      }
    );
  });
});

// PRODUCT LIST
router.get("/product-list", (req, res) => {
  if (!req.session.admin) return res.redirect("/login");

  User.getAll((err, users) => {
    if (err) throw err;

    const totalCustomers = users.length;

    ejs.renderFile(
      path.join(__dirname, "../views/pages/admin/product/product_list.ejs"),
      { users, totalCustomers },
      (err, content) => {
        res.render("layouts/atmin", {
          title: "Product List | Lably",
          meta: "",
          style: `
            <link rel="stylesheet" href="/css/sidebar.css">
            <link rel="stylesheet" href="/css/product-list.css">
          `,
          content,
          message: null,
          showPopup: false,
        });
      }
    );
  });
});

// PRODUCT CREATE
router.get("/product-create", (req, res) => {
  if (!req.session.admin) return res.redirect("/login");

  User.getAll((err, users) => {
    if (err) throw err;

    const totalCustomers = users.length;

    ejs.renderFile(
      path.join(__dirname, "../views/pages/admin/product/product_create.ejs"),
      { users, totalCustomers },
      (err, content) => {
        res.render("layouts/atmin", {
          title: "Product Create | Lably",
          meta: "",
          style: `
            <link rel="stylesheet" href="/css/sidebar.css">
            <link rel="stylesheet" href="/css/product-create.css">
          `,
          content,
          message: null,
          showPopup: false,
        });
      }
    );
  });
});

// PRODUCT CREATE
router.get("/product-detail", (req, res) => {
  if (!req.session.admin) return res.redirect("/login");

  User.getAll((err, users) => {
    if (err) throw err;

    const totalCustomers = users.length;

    ejs.renderFile(
      path.join(__dirname, "../views/pages/admin/product/product_detail.ejs"),
      { users, totalCustomers },
      (err, content) => {
        res.render("layouts/atmin", {
          title: "Product Create | Lably",
          meta: "",
          style: `
            <link rel="stylesheet" href="/css/sidebar.css">
            <link rel="stylesheet" href="/css/product-detail.css">
          `,
          content,
          message: null,
          showPopup: false,
        });
      }
    );
  });
});

// ANALYTICS PAGE
router.get("/analytics", (req, res) => {
  if (!req.session.admin) return res.redirect("/login");

  User.getAll((err, users) => {
    if (err) throw err;

    const totalCustomers = users.length;

    ejs.renderFile(
      path.join(__dirname, "../views/pages/admin/analytics.ejs"),
      { users, totalCustomers },
      (err, content) => {
        res.render("layouts/atmin", {
          title: "Analytics | Lably",
          meta: "",
          style: `
            <link rel="stylesheet" href="/css/sidebar.css">
            <link rel="stylesheet" href="/css/analytics.css">
          `,
          content,
          message: null,
          showPopup: false,
        });
      }
    );
  });
});

// CATEGORY
router.get("/category", categoryController.index);
router.get("/category/create", categoryController.createPage);
router.post("/category/create", categoryController.create);
router.get("/category/edit/:id", categoryController.editPage);
router.post("/category/update/:id", categoryController.update);
router.get("/category/delete/:id", categoryController.delete);

module.exports = router;
