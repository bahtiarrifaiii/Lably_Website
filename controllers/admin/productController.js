const ejs = require("ejs");
const path = require("path");
const Product = require("../../models/productModel");
const Category = require("../../models/categoryModel");

exports.list = (req, res) => {
  if (!req.session.admin) return res.redirect("/login");

  const popupMessage = req.session.message || null;
  req.session.message = null;

  Product.getAllWithCategory((err, products) => {
    if (err) throw err;

    const filePath = path.join(
      __dirname,
      "../../views/pages/admin/product/product-list.ejs",
    );

    ejs.renderFile(
      filePath,
      {
        products,
        search: "",
        currentPage: 1,
        totalPages: 1,
        limit: products.length,
      },
      (err2, content) => {
        if (err2) throw err2;

        res.render("layouts/admin", {
          title: "Product List | Lably",
          currentPage: "/product-list",
          style: `
            <link rel="stylesheet" href="/css/admin/sidebar.css">
            <link rel="stylesheet" href="/css/admin/product-list.css">
          `,
          meta: "",
          content,
          message: popupMessage,
          showPopup: !!popupMessage,
        });
      },
    );
  });
};

exports.createPage = (req, res) => {
  if (!req.session.admin) return res.redirect("/login");

  const popupMessage = req.session.message || null;
  req.session.message = null;

  Category.getAll((err, categories) => {
    if (err) throw err;

    const filePath = path.join(
      __dirname,
      "../../views/pages/admin/product/product-create.ejs",
    );

    ejs.renderFile(filePath, { categories }, (err2, content) => {
      if (err2) throw err2;

      res.render("layouts/admin", {
        title: "Product Create | Lably",
        currentPage: "/product-create",
        style: `
          <link rel="stylesheet" href="/css/admin/sidebar.css">
          <link rel="stylesheet" href="/css/admin/product-create.css">
        `,
        meta: "",
        content,
        message: popupMessage,
        showPopup: !!popupMessage,
      });
    });
  });
};

exports.create = (req, res) => {
  const { name, description, id_category, stock, kondisi, price } = req.body;

  Product.findByName(name, (err, rows) => {
    if (err) throw err;

    if (rows.length > 0) {
      req.session.message = {
        type: "error",
        text: `Product "${name}" already exists.`,
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
      req.session.message = err2
        ? { type: "error", text: `Failed to add "${name}".` }
        : { type: "success", text: `"${name}" added successfully.` };

      res.redirect("/product-list");
    });
  });
};

exports.detailPage = (req, res) => {
  if (!req.session.admin) return res.redirect("/login");

  const { id } = req.params;
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

    Category.getAll((err2, categories) => {
      if (err2) throw err2;

      const filePath = path.join(
        __dirname,
        "../../views/pages/admin/product/product-detail.ejs",
      );

      ejs.renderFile(
        filePath,
        { product: product[0], categories },
        (err3, content) => {
          if (err3) throw err3;

          res.render("layouts/admin", {
            title: "Product Detail | Lably",
            currentPage: "/product-detail",
            style: `
              <link rel="stylesheet" href="/css/admin/sidebar.css">
              <link rel="stylesheet" href="/css/admin/product-detail.css">
            `,
            meta: "",
            content,
            message: popupMessage,
            showPopup: !!popupMessage,
          });
        },
      );
    });
  });
};

exports.update = (req, res) => {
  const { id } = req.params;
  const { name, description, id_category, stock, kondisi, price } = req.body;

  Product.findByNameExcludingId(name, id, (err, rows) => {
    if (err) throw err;

    if (rows.length > 0) {
      req.session.message = {
        type: "error",
        text: `Product "${name}" already exists.`,
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
      req.session.message = err2
        ? { type: "error", text: `Failed to update "${name}".` }
        : { type: "success", text: `"${name}" updated successfully.` };

      res.redirect("/product-list");
    });
  });
};

exports.delete = (req, res) => {
  const { id } = req.params;

  Product.getById(id, (err, product) => {
    if (err) throw err;

    const name = product?.[0]?.name || "(unknown)";

    Product.delete(id, (err2) => {
      req.session.message = err2
        ? { type: "error", text: `Failed to delete "${name}".` }
        : { type: "success", text: `"${name}" deleted successfully.` };

      res.redirect("/product-list");
    });
  });
};
