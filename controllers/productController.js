const ejs = require("ejs");
const path = require("path");
const Product = require("../models/productModel");
const Category = require("../models/categoryModel");

/* ============================================================
    LIST + SEARCH + PAGINATION
============================================================ */
exports.list = (req, res) => {
  if (!req.session.admin) return res.redirect("/login");

  const limit = 5;
  const page = parseInt(req.query.page) || 1;
  const search = req.query.search ? req.query.search.trim() : "";

  const popupMessage = req.session.message || null;
  req.session.message = null;

  Product.count(search, (err, resultCount) => {
    if (err) throw err;

    const totalItems = resultCount[0].total;
    const totalPages = totalItems > 0 ? Math.ceil(totalItems / limit) : 1;
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const offset = (currentPage - 1) * limit;

    Product.getPaginated(search, limit, offset, (err, products) => {
      if (err) throw err;

      const filePath = path.join(
        __dirname,
        "../views/pages/admin/product/product_list.ejs"
      );

      ejs.renderFile(
        filePath,
        { products, currentPage, totalPages, search, limit },
        (err, content) => {
          if (err) throw err;

          res.render("layouts/atmin", {
            title: "Product List | Lably",
            meta: "",
            style: `
              <link rel="stylesheet" href="/css/sidebar.css">
              <link rel="stylesheet" href="/css/product-list.css">
            `,
            content,
            message: popupMessage,
            showPopup: !!popupMessage,
            currentPage: "/product-list",
          });
        }
      );
    });
  });
};

/* ============================================================
    CREATE PAGE
============================================================ */
exports.createPage = (req, res) => {
  if (!req.session.admin) return res.redirect("/login");

  const popupMessage = req.session.message || null;
  req.session.message = null;

  Category.getAll((err, categories) => {
    if (err) throw err;

    const filePath = path.join(
      __dirname,
      "../views/pages/admin/product/product_create.ejs"
    );

    ejs.renderFile(filePath, { categories }, (err, content) => {
      if (err) throw err;

      res.render("layouts/atmin", {
        title: "Product Create | Lably",
        meta: "",
        style: `
          <link rel="stylesheet" href="/css/sidebar.css">
          <link rel="stylesheet" href="/css/product-create.css">
        `,
        content,
        message: popupMessage,
        showPopup: !!popupMessage,
        currentPage: "/product-create",
      });
    });
  });
};

/* ============================================================
    CREATE ACTION
============================================================ */
exports.create = (req, res) => {
  const { name, description, id_category, stock, kondisi, price } = req.body;

  // Cek nama duplikat
  Product.findByName(name, (err, rows) => {
    if (err) throw err;

    if (rows.length > 0) {
      req.session.message = {
        type: "error",
        text: `Product "${name}" already exists and cannot be added.`,
      };
      return res.redirect("/product-create");
    }

    const newProduct = {
      name,
      description,
      id_category,
      stock,
      kondisi,
      price,
      image: req.file ? req.file.filename : null,
    };

    Product.create(newProduct, (err2) => {
      if (err2) {
        req.session.message = {
          type: "error",
          text: `Product "${name}" failed to be added.`,
        };
      } else {
        req.session.message = {
          type: "success",
          text: `Product "${name}" successfully added.`,
        };
      }
      return res.redirect("/product-list");
    });
  });
};

/* ============================================================
    DETAIL PAGE
============================================================ */
exports.detailPage = (req, res) => {
  if (!req.session.admin) return res.redirect("/login");

  const id = req.params.id;
  const popupMessage = req.session.message || null;
  req.session.message = null;

  Product.getById(id, (err, product) => {
    if (err) throw err;

    if (!product || product.length === 0) {
      req.session.message = {
        type: "error",
        text: "Product not found.",
      };
      return res.redirect("/product-list");
    }

    Category.getAll((err, categories) => {
      if (err) throw err;

      const filePath = path.join(
        __dirname,
        "../views/pages/admin/product/product_detail.ejs"
      );

      ejs.renderFile(
        filePath,
        { product: product[0], categories },
        (err, content) => {
          if (err) throw err;

          res.render("layouts/atmin", {
            title: "Product Detail | Lably",
            meta: "",
            style: `
              <link rel="stylesheet" href="/css/sidebar.css">
              <link rel="stylesheet" href="/css/product-detail.css">
            `,
            content,
            message: popupMessage,
            showPopup: !!popupMessage,
            currentPage: "/product-detail",
          });
        }
      );
    });
  });
};

/* ============================================================
    UPDATE ACTION
============================================================ */
exports.update = (req, res) => {
  const id = req.params.id;
  const { name, description, id_category, stock, kondisi, price } = req.body;

  // Cek duplikat nama kecuali dirinya sendiri
  Product.findByNameExcludingId(name, id, (err, rows) => {
    if (err) throw err;

    if (rows.length > 0) {
      req.session.message = {
        type: "error",
        text: `Product "${name}" already exists and cannot be updated.`,
      };
      return res.redirect(`/product-detail/${id}`);
    }

    const updatedProduct = {
      name,
      description,
      id_category,
      stock,
      kondisi,
      price,
      image: req.file ? req.file.filename : req.body.old_image,
    };

    Product.update(id, updatedProduct, (err2) => {
      if (err2) {
        req.session.message = {
          type: "error",
          text: `Product "${name}" failed to be updated.`,
        };
      } else {
        req.session.message = {
          type: "success",
          text: `Product "${name}" successfully updated.`,
        };
      }
      return res.redirect("/product-list");
    });
  });
};

/* ============================================================
    DELETE ACTION
============================================================ */
exports.delete = (req, res) => {
  const id = req.params.id;

  Product.getById(id, (err, product) => {
    if (err) throw err;

    const name = product && product[0] ? product[0].name : "";

    Product.delete(id, (err2) => {
      if (err2) {
        req.session.message = {
          type: "error",
          text: `Product "${name}" failed to be deleted.`,
        };
      } else {
        req.session.message = {
          type: "success",
          text: `Product "${name}" successfully deleted.`,
        };
      }

      return res.redirect("/product-list");
    });
  });
};
