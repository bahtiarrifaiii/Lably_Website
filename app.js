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

// Jalankan server
app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
