const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");

// Public folder untuk CSS & Asset
app.use(express.static(path.join(__dirname, "public")));

// Set view engine EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ROUTE HOME
app.get("/", async (req, res) => {
  // Render halaman konten
  const content = await ejs.renderFile(
    path.join(__dirname, "views/pages/home.ejs"),
    {}
  );

  // Render ke layout
  res.render("layouts/main", {
    title: "Home | Lably Official Web",
    showFooter: true,

    meta: `
            <meta name="description" content="LabLy: Solusi terdepan untuk pengadaan alat riset dan laboratorium. Kami menyediakan mikroskop berkualitas tinggi dan peralatan ilmiah esensial untuk penelitian Anda." />
            <meta name="keywords" content="LabLy, alat riset, alat laboratorium, mikroskop, peralatan ilmiah, pengadaan alat lab, pinjam alat riset" />
            <meta name="author" content="LabLy" />
        `,

    style: `
            <link rel="stylesheet" href="/CSS/home.css" />
        `,

    content,
  });
});

<<<<<<< HEAD
// ROUTE CATALOGUE
app.get("/catalogue", async (req, res) => {
  // Render halaman konten
  const content = await ejs.renderFile(
    path.join(__dirname, "views/pages/catalogue.ejs"),
    {}
  );

  // Render ke layout
  res.render("layouts/main", {
    title: "Catalogue | Lably Official Web",
    showFooter: true,

    meta: `
            <meta name="description" content="Katalog LabLy: Temukan mikroskop berkualitas tinggi, sentrifuga, inkubator, dan berbagai instrumen laboratorium esensial. Akses alat riset terbaik tanpa investasi besar." />
            <meta name="keywords" content="Katalog LabLy, mikroskop, sentrifuga, inkubator, instrumen laboratorium, alat riset, daftar alat lab, harga alat laboratorium" />
            <meta name="author" content="LabLy" />
        `,

    style: `
            <link rel="stylesheet" href="/CSS/catalogue.css" />
        `,

    content,
=======
app.get("/login", async (req, res) => {
  const content = await ejs.renderFile(
    path.join(__dirname, "views/pages/login.ejs"),
    {}
  );

  res.render("layouts/auth", {
    title: "Login | LabLy",
    meta: "",
    style: "",
    content
  });
});

app.get("/register", async (req, res) => {
  const content = await ejs.renderFile(
    path.join(__dirname, "views/pages/register.ejs"),
    {}
  );

  res.render("layouts/auth", {
    title: "Register | LabLy",
    meta: "",
    style: "",
    content
>>>>>>> 74108909f21f6d53e89642c8f07d3780243fee4a
  });
});

// Jalankan server
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
