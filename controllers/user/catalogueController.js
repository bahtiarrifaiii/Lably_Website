const path = require("path");
const ejs = require("ejs");
const db = require("../../config/database");
const Product = require("../../models/productModel");
const User = require("../../models/userModel");

function renderWithUser(req, callback) {
  const userId = req.session.user?.id;
  if (!userId) return callback(null);

  User.getById(userId, (err, userRows) => {
    const user = !err && userRows && userRows.length ? userRows[0] : null;
    callback(user);
  });
}

module.exports = {
  home: (req, res) => {
    const filter = req.query.filter || "default";
    let sql = "";

    if (filter === "best") {
      sql = `
        SELECT p.id, p.name, p.price, p.image, p.stock
        FROM products p
        JOIN (
          SELECT id_products, COUNT(*) AS total
          FROM peminjaman
          GROUP BY id_products
          HAVING total > 3
        ) AS t
        ON p.id = t.id_products
        LIMIT 6
      `;
    } else if (filter === "available") {
      sql = `
        SELECT id, name, price, image, stock
        FROM products
        WHERE stock > 1
        LIMIT 6
      `;
    } else {
      sql = `
        SELECT id, name, price, image, stock
        FROM products
        LIMIT 6
      `;
    }

    db.query(sql, async (err, products) => {
      if (err) {
        console.error("Error loading products:", err);
        products = [];
      }

      const catalogue = products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        img: p.image ? `/uploads/${p.image}` : "/assets/default.png",
        stock: p.stock,
      }));

      const content = await ejs.renderFile(
        path.join(__dirname, "../../views/pages/user/home.ejs"),
        { catalogue, activeFilter: filter },
      );

      renderWithUser(req, (user) => {
        res.render("layouts/main", {
          title: "Home | Lably Official Web",
          currentPage: "home",
          showFooter: true,
          meta: `<meta name="description" content="LabLy: Solusi alat riset dan laboratorium." />`,
          style: `<link rel="stylesheet" href="/css/user/home.css" />`,
          content,
          user,
        });
      });
    });
  },

  bestItemsApi: (req, res) => {
    const sql = `
      SELECT 
        pr.id,
        pr.name,
        pr.price,
        pr.image,
        pr.stock,
        SUM(p.qty) AS total_qty
      FROM peminjaman p
      JOIN products pr ON p.id_products = pr.id
      GROUP BY pr.id, pr.name, pr.price, pr.image, pr.stock
      ORDER BY total_qty DESC
      LIMIT 3
    `;

    db.query(sql, (err, rows) => {
      if (err) {
        console.error(err);
        return res.json([]);
      }

      const items = rows.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        img: p.image ? `/uploads/${p.image}` : "/assets/default.png",
        stock: p.stock,
      }));
      res.json(items);
    });
  },

  availabilityApi: (req, res) => {
    const sql = `
      SELECT id, name, price, image, stock
      FROM products
      WHERE stock > 1
      LIMIT 6
    `;

    db.query(sql, (err, rows) => {
      if (err) return res.json([]);

      const items = rows.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        img: p.image ? `/uploads/${p.image}` : "/assets/default.png",
        stock: p.stock,
      }));

      res.json(items);
    });
  },

  catalogue: (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = 9;
    const offset = (page - 1) * limit;

    const search = req.query.search || "";
    const category = req.query.category || "all";
    const selectedPrice = req.query.price || "all";

    Product.getPaginated(search, limit, offset, category, (err, products) => {
      if (err) return res.status(500).send("Error fetching products");

      Product.count(search, category, (err2, result) => {
        if (err2) return res.status(500).send("Error counting products");

        const totalProducts = result[0].total;
        const totalPages = Math.ceil(totalProducts / limit);

        db.query("SELECT * FROM category", (err3, categories) => {
          if (err3) return res.status(500).send("Error fetching categories");

          ejs.renderFile(
            path.join(__dirname, "../../views/pages/user/catalogue.ejs"),
            {
              products,
              categories,
              currentPage: page,
              totalPages,
              selectedCategory: category,
              selectedPrice,
              search,
            },
            (err4, content) => {
              if (err4) {
                console.log("EJS ERROR:", err4);
                return res.status(500).send("EJS render error");
              }

              renderWithUser(req, (user) => {
                res.render("layouts/main", {
                  title: "Catalogue | Lably Official Web",
                  currentPage: "catalogue",
                  showFooter: true,
                  meta: `
                    <meta name="description" content="Katalog alat laboratorium LabLy." />
                    <meta name="keywords" content="LabLy, alat riset, laboratorium" />
                  `,
                  style: `<link rel="stylesheet" href="/css/user/catalogue.css" />`,
                  content,
                  user,
                });
              });
            },
          );
        });
      });
    });
  },

  hideReminder: (req, res) => {
    req.session.hideReminder = true;
    return res.json({ success: true });
  },

  productDetail: (req, res) => {
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
      const popupMessage = req.session.message || null;
      req.session.message = null;

      const content = await ejs.renderFile(
        path.join(__dirname, "../../views/pages/user/product.ejs"),
        { product, message: popupMessage, showPopup: !!popupMessage },
      );

      renderWithUser(req, (user) => {
        res.render("layouts/main", {
          title: `${product.name} | Lably Web`,
          currentPage: "product",
          showFooter: true,
          meta: `<meta name="description" content="${product.name}"/>`,
          style: `<link rel="stylesheet" href="/css/user/product.css" />`,
          content,
          user,
          message: popupMessage,
          showPopup: !!popupMessage,
        });
      });
    });
  },
};
