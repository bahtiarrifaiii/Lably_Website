const express = require("express");
const session = require("express-session");
const app = express();
const ejs = require("ejs");
const path = require("path");

// ==========================
// 1. Middleware penting
// ==========================

// Untuk membaca data POST dari form
app.use(express.urlencoded({ extended: true }));

// Session
app.use(
  session({
    secret: "lably-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Public folder (CSS, JS, Asset)
app.use(express.static(path.join(__dirname, "public")));

// Set view engine EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ==========================
// 2. ROUTE HOME
// ==========================

app.get("/", async (req, res) => {
  const content = await ejs.renderFile(
    path.join(__dirname, "views/pages/home.ejs"),
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

// ==========================
// 3. ROUTE CATALOGUE
// ==========================

app.get("/catalogue", async (req, res) => {
  const content = await ejs.renderFile(
    path.join(__dirname, "views/pages/catalogue.ejs"),
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

// ==========================
// 4. ROUTE PRODUCT
// ==========================

app.get("/product", async (req, res) => {
  const content = await ejs.renderFile(
    path.join(__dirname, "views/pages/product.ejs"),
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

// ==========================
// 5. ROUTE FORM
// ==========================

app.get("/form", async (req, res) => {
  const content = await ejs.renderFile(
    path.join(__dirname, "views/pages/form.ejs"),
    {}
  );

  res.render("layouts/forms", {
    title: "Form | LabLy",
    meta: "",
    style: "",
    content,
  });
});

// ==========================
// 6. ROUTE CART
// ==========================

app.get("/cart", async (req, res) => {
  const content = await ejs.renderFile(
    path.join(__dirname, "views/pages/cart.ejs"),
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

// ==========================
// 7. ROUTES AUTENTIKASI (LOGIN, REGISTER)
// ==========================

const routes = require("./routes/index");
app.use("/", routes);

// ==========================
// 8. Jalankan server
// ==========================

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
