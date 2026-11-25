const path = require("path");
const ejs = require("ejs");
const Product = require("../../models/productModel");
const User = require("../../models/userModel");
const Order = require("../../models/orderModel");

module.exports = {
  dashboard: async (req, res) => {
    if (!req.session.admin) {
      return res.redirect("/login");
    }

    const admin = req.session.admin;
    const message = req.session.message || null;
    req.session.message = null;

    Product.getAll((err, products) => {
      if (err) throw err;

      User.getAll((err2, users) => {
        if (err2) throw err2;

        Order.getAll((err3, orders) => {
          if (err3) throw err3;

          const contentData = {
            admin,
            productsCount: products.length,
            customersCount: users.length,
            ordersCount: orders.length,
            customers: users,
            today: new Date(),
          };

          ejs.renderFile(
            path.join(__dirname, "../../views/pages/admin/dashboard.ejs"),
            contentData,
            (renderErr, content) => {
              if (renderErr) throw renderErr;

              res.render("layouts/admin", {
                title: "Dashboard | Lably",
                meta: "",
                style: `
                  <link rel="stylesheet" href="/css/admin/sidebar.css">
                  <link rel="stylesheet" href="/css/admin/dashboard.css">
                `,
                content,
                message,
                showPopup: true,
                currentPage: "/dashboard",
              });
            },
          );
        });
      });
    });
  },
};
