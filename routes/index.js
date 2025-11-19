// routes/index.js
const express = require("express");
const router = express.Router();
const ejs = require("ejs");
const path = require("path");

// Controller
const authController = require("../controllers/authController");

// ==========================
// HOME PAGE
// ==========================
router.get("/", (req, res) => {
  const dataHome = {
    title: "Sistem Peminjaman Alat Lab",
    message: "Selamat datang di sistem peminjaman alat laboratorium.",
  };

  res.render("index", dataHome);
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
  req.session.destroy((err) => {
    if (err) {
      console.log("Logout error:", err);
      return res.redirect("/dashboard");
    }

    // Regenerate session baru buat message
    req.session = null;
    req.sessionStore?.regenerate?.(req, () => {
      req.session.message = {
        type: "success",
        text: "Selamat tinggal, Admin!"
      };

      res.redirect("/login");
    });
  });
});


// ==========================
// DASHBOARD PAGE (ADMIN)
// Ambil data dari controller
// ==========================
router.get("/dashboard", authController.dashboard);


module.exports = router;


