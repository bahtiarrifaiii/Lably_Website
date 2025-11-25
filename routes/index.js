// routes/index.js
const express = require("express");
const router = express.Router();
const ejs = require("ejs");
const path = require("path");
const User = require("../models/userModel");

// Controllers
const authController = require("../controllers/authController");
const categoryController = require("../controllers/categoryController");

// ==========================
// HOME PAGE
// ==========================
router.get("/", (req, res) => {
  res.render("index", {
    title: "Sistem Peminjaman Alat Lab",
    message: "Selamat datang di sistem peminjaman alat laboratorium.",
  });
});

// ==========================
// LOGIN PAGE
// ==========================
router.get("/login", async (req, res) => {
  const message = req.session.message || null;
  req.session.message = null;

  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/login.ejs"),
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

// ==========================
// REGISTER PAGE
// ==========================
router.get("/register", async (req, res) => {
  const message = req.session.message || null;
  req.session.message = null;

  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/register.ejs"),
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

// ==========================
// FORM PAGE
// ==========================
router.get("/form", async (req, res) => {
  const message = req.session.message || null;
  req.session.message = null;

  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/form.ejs"),
    { message }
  );

  res.render("layouts/forms", {
    title: "Form | Lably",
    meta: "",
    style: "",
    content,
  });
});

// ==========================
// LOGOUT
// ==========================
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

// ==========================
// DASHBOARD PAGE
// ==========================
router.get("/dashboard", authController.dashboard);

// ==========================
// CUSTOMERS PAGE
// ==========================
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
          showPopup: false
        });
      }
    );
  });
});

// ==========================
// CUSTOMERS PAGE
// ==========================
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
          showPopup: false
        });
      }
    );
  });
});

// ==========================
// CATEGORY 
// ==========================
router.get("/category", categoryController.index);
router.get("/category/create", categoryController.createPage);
router.post("/category/create", categoryController.create);
router.get("/category/edit/:id", categoryController.editPage);
router.post("/category/update/:id", categoryController.update);
router.get("/category/delete/:id", categoryController.delete);

module.exports = router;
