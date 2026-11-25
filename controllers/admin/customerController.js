const path = require("path");
const ejs = require("ejs");
const Customer = require("../../models/customerModel");

module.exports = {
  list: (req, res) => {
    const search = req.query.search || "";
    const status = req.query.status || "all";
    const dateStart = req.query.dateStart || "";
    const dateEnd = req.query.dateEnd || "";
    const page = parseInt(req.query.page, 10) || 1;

    const limit = 5;
    const offset = (page - 1) * limit;

    Customer.countFiltered(
      search,
      status,
      dateStart,
      dateEnd,
      (err, countResult) => {
        if (err) throw err;

        const totalCustomers = countResult[0].total;
        const totalPages = Math.ceil(totalCustomers / limit);

        Customer.getFiltered(
          search,
          status,
          dateStart,
          dateEnd,
          limit,
          offset,
          (err2, users) => {
            if (err2) throw err2;

            ejs.renderFile(
              path.join(__dirname, "../../views/pages/admin/customer.ejs"),
              {
                users,
                totalCustomers,
                page,
                totalPages,
                limit,
                search,
                status,
                dateStart,
                dateEnd,
              },
              (renderErr, content) => {
                if (renderErr) throw renderErr;

                res.render("layouts/admin", {
                  title: "Customers | Lably",
                  style: `
                    <link rel="stylesheet" href="/css/admin/sidebar.css">
                    <link rel="stylesheet" href="/css/admin/customer.css">
                  `,
                  content,
                  currentPage: "/customer",
                });
              },
            );
          },
        );
      },
    );
  },

  detail: (req, res) => {
    const { id } = req.params;

    Customer.getById(id, (err, userRows) => {
      if (err) throw err;

      if (!userRows || userRows.length === 0) {
        return res.redirect("/customer");
      }

      const user = userRows[0];

      ejs.renderFile(
        path.join(__dirname, "../../views/pages/admin/customer-detail.ejs"),
        { user },
        (renderErr, content) => {
          if (renderErr) throw renderErr;

          res.render("layouts/admin", {
            title: "Detail Customer | Lably",
            style: `
              <link rel="stylesheet" href="/css/admin/sidebar.css">
              <link rel="stylesheet" href="/css/admin/customer-detail.css">
            `,
            content,
            currentPage: "/customer",
          });
        },
      );
    });
  },

  approveKtp: (req, res) => {
    const { id } = req.params;
    Customer.updateKtpStatus(id, "verified", (err) => {
      if (err) throw err;
      res.redirect(`/customer/${id}`);
    });
  },

  rejectKtp: (req, res) => {
    const { id } = req.params;
    Customer.updateKtpStatus(id, "rejected", (err) => {
      if (err) throw err;
      res.redirect(`/customer/${id}`);
    });
  },
};
