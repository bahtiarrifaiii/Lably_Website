const Category = require("../models/categoryModel");
const path = require("path");
const ejs = require("ejs");

module.exports = {
  // =============================
  // LIST PAGE
  // =============================
  index: (req, res) => {
    if (!req.session.admin) return res.redirect("/login");

    const message = req.session.message || null;
    req.session.message = null;

    Category.getAll((err, categories) => {
      if (err) throw err;

      ejs.renderFile(
        path.join(__dirname, "../views/pages/admin/category/index.ejs"),
        { categories },
        (err, content) => {
          res.render("layouts/atmin", {
            title: "Category | Lably",
            meta: "",
            style: `
                            <link rel="stylesheet" href="/CSS/sidebar.css">
                            <link rel="stylesheet" href="/CSS/admin-category.css">
                        `,
            content,
            message,

            currentPage: req.path,
          });
        }
      );
    });
  },

  // =============================
  // CREATE PAGE
  // =============================
  createPage: (req, res) => {
    ejs.renderFile(
      path.join(__dirname, "../views/pages/admin/category/create.ejs"),
      {},
      (err, content) => {
        res.render("layouts/atmin", {
          title: "Add Category | Lably",
          meta: "",
          style: `
                        <link rel="stylesheet" href="/CSS/sidebar.css">
                        <link rel="stylesheet" href="/CSS/admin-category.css">
                    `,
          content,
          currentPage: req.path,
        });
      }
    );
  },

  // =============================
  // CREATE ACTION
  // =============================
  create: (req, res) => {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      req.session.message = {
        type: "error",
        text: "Category name cannot be empty!",
      };
      return res.redirect("/category/create");
    }

    // 🔍 Cek duplicate
    Category.findByName(name, (err, rows) => {
      if (rows.length > 0) {
        req.session.message = {
          type: "error",
          text: "Category already exists!",
        };
        return res.redirect("/category");
      }

      Category.create(name, (err2) => {
        if (err2) throw err2;

        req.session.message = {
          type: "success",
          text: "Category added successfully!",
        };

        return res.redirect("/category");
      });
    });
  },

  // =============================
  // EDIT PAGE
  // =============================
  editPage: (req, res) => {
    Category.getById(req.params.id, (err, result) => {
      if (!result || result.length === 0) return res.redirect("/category");

      const category = result[0];

      ejs.renderFile(
        path.join(__dirname, "../views/pages/admin/category/edit.ejs"),
        { category },
        (err, content) => {
          res.render("layouts/atmin", {
            title: "Edit Category | Lably",
            meta: "",
            style: `
                            <link rel="stylesheet" href="/CSS/sidebar.css">
                            <link rel="stylesheet" href="/CSS/admin-category.css">
                        `,
            content,
            currentPage: req.path,
          });
        }
      );
    });
  },

  // =============================
  // UPDATE ACTION
  // =============================
  update: (req, res) => {
    const { name } = req.body;
    const { id } = req.params;

    if (!name || name.trim() === "") {
      req.session.message = {
        type: "error",
        text: "Category name cannot be empty!",
      };
      return res.redirect(`/category/edit/${id}`);
    }

    // 🔍 Cek duplicate daripada kategori lain
    Category.findByName(name, (err, rows) => {
      if (rows.length > 0 && rows[0].id != id) {
        req.session.message = {
          type: "error",
          text: "Category name already exists!",
        };
        return res.redirect(`/category/edit/${id}`);
      }

      Category.update(id, name, (err2) => {
        if (err2) throw err2;

        req.session.message = {
          type: "success",
          text: "Category updated successfully!",
        };
        return res.redirect("/category");
      });
    });
  },

  // =============================
  // DELETE ACTION
  // =============================
  delete: (req, res) => {
    Category.delete(req.params.id, (err) => {
      if (err) throw err;

      req.session.message = {
        type: "success",
        text: "Category deleted successfully!",
      };

      return res.redirect("/category");
    });
  },
};
