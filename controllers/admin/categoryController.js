const path = require("path");
const ejs = require("ejs");
const Category = require("../../models/categoryModel");

module.exports = {
  index: (req, res) => {
    if (!req.session.admin) return res.redirect("/login");

    const message = req.session.message || null;
    req.session.message = null;

    Category.getAll((err, categories) => {
      if (err) return res.status(500).send("Internal Server Error");

      ejs.renderFile(
        path.join(__dirname, "../../views/pages/admin/category/index.ejs"),
        { categories, message },
        (err2, content) => {
          if (err2) return res.status(500).send("Render Error");

          res.render("layouts/admin", {
            title: "Category | Lably",
            style: `
              <link rel="stylesheet" href="/css/admin/sidebar.css">
              <link rel="stylesheet" href="/css/admin/admin-category.css">
            `,
            content,
            currentPage: req.path,
            message,
          });
        },
      );
    });
  },

  createPage: (req, res) => {
    const message = req.session.message || null;
    req.session.message = null;

    ejs.renderFile(
      path.join(__dirname, "../../views/pages/admin/category/create.ejs"),
      { message },
      (err, content) => {
        if (err) return res.status(500).send("Render Error");

        res.render("layouts/admin", {
          title: "Add Category | Lably",
          style: `
            <link rel="stylesheet" href="/css/admin/sidebar.css">
            <link rel="stylesheet" href="/css/admin/admin-category.css">
          `,
          content,
          currentPage: req.path,
          message,
        });
      },
    );
  },

  create: (req, res) => {
    const { name } = req.body;

    if (!name.trim()) {
      req.session.message = {
        type: "error",
        text: "Nama kategori tidak boleh kosong!",
      };
      return res.redirect("/category/create");
    }

    Category.findByName(name, (err, rows) => {
      if (rows.length > 0) {
        req.session.message = {
          type: "error",
          text: "Category dengan nama tersebut sudah ada!",
        };
        return res.redirect("/category/create");
      }

      Category.create(name, () => {
        req.session.message = {
          type: "success",
          text: `Category "${name}" berhasil ditambahkan!`,
        };
        return res.redirect("/category");
      });
    });
  },

  editPage: (req, res) => {
    const message = req.session.message || null;
    req.session.message = null;

    Category.getById(req.params.id, (err, result) => {
      if (err || result.length === 0) return res.redirect("/category");

      ejs.renderFile(
        path.join(__dirname, "../../views/pages/admin/category/edit.ejs"),
        { category: result[0], message },
        (err2, content) => {
          if (err2) return res.status(500).send("Render Error");

          res.render("layouts/admin", {
            title: "Edit Category | Lably",
            style: `
              <link rel="stylesheet" href="/css/admin/sidebar.css">
              <link rel="stylesheet" href="/css/admin/admin-category.css">
            `,
            content,
            currentPage: req.path,
            message,
          });
        },
      );
    });
  },

  update: (req, res) => {
    const { name } = req.body;
    const { id } = req.params;

    if (!name.trim()) {
      req.session.message = {
        type: "error",
        text: "Nama kategori tidak boleh kosong!",
      };
      return res.redirect(`/category/edit/${id}`);
    }

    Category.findByName(name, (err, rows) => {
      if (rows.length > 0 && rows[0].id != id) {
        req.session.message = {
          type: "error",
          text: "Nama kategori sudah digunakan!",
        };
        return res.redirect(`/category/edit/${id}`);
      }

      Category.update(id, name, () => {
        req.session.message = {
          type: "success",
          text: `Category "${name}" berhasil diperbarui!`,
        };
        return res.redirect("/category");
      });
    });
  },

  delete: (req, res) => {
    const { id } = req.params;

    Category.countProducts(id, (err, result) => {
      if (err) {
        req.session.message = { type: "error", text: "Database error!" };
        return res.redirect("/category");
      }

      if (result[0].total > 0) {
        req.session.message = {
          type: "error",
          text: "Category tidak bisa dihapus karena sedang digunakan oleh produk!",
        };
        return res.redirect("/category");
      }

      Category.delete(id, () => {
        req.session.message = {
          type: "success",
          text: "Category berhasil dihapus!",
        };
        return res.redirect("/category");
      });
    });
  },
};
