const Customer = require("../models/customerModel");
const path = require("path");
const ejs = require("ejs");

module.exports = {
    list: (req, res) => {

        const search = req.query.search || "";
        const status = req.query.status || "all";
        const dateStart = req.query.dateStart || "";
        const dateEnd = req.query.dateEnd || "";
        const page = parseInt(req.query.page) || 1;

        const limit = 10;
        const offset = (page - 1) * limit;

        Customer.countFiltered(search, status, dateStart, dateEnd, (err, countResult) => {
            if (err) throw err;

            const totalCustomers = countResult[0].total;
            const totalPages = Math.ceil(totalCustomers / limit);

            Customer.getFiltered(search, status, dateStart, dateEnd, limit, offset, (err, users) => {
                if (err) throw err;

                console.log("LOAD CUSTOMER EJS FROM:", path.join(__dirname, "../views/pages/admin/customer.ejs"));

                ejs.renderFile(
                    path.join(__dirname, "../views/pages/admin/customer.ejs"),
                    {
                        users,
                        totalCustomers,
                        page,
                        totalPages,
                        search,
                        status,
                        dateStart,
                        dateEnd
                    },
                    (err, content) => {
                        if (err) throw err;

                        res.render("layouts/atmin", {
                            title: "Customers | Lably",
                            style: `
                                <link rel="stylesheet" href="/CSS/sidebar.css">
                                <link rel="stylesheet" href="/CSS/customer.css">
                            `,
                            content,
                            currentPage: "/customer"
                        });
                    }
                );
            });
        });
    }
};
