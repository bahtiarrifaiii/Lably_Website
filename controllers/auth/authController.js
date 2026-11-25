const bcrypt = require("bcrypt");
const path = require("path");
const ejs = require("ejs");
const User = require("../../models/userModel");
const Admin = require("../../models/adminModel");

module.exports = {
  loginPage: async (req, res) => {
    const message = req.session.message || null;
    req.session.message = null;

    const content = await ejs.renderFile(
      path.join(__dirname, "../../views/pages/auth/login.ejs"),
      { message },
    );

    res.render("layouts/auth", {
      title: "Login | Lably",
      meta: "",
      style: "",
      content,
    });
  },

  login: (req, res) => {
    const { email, password } = req.body;

    Admin.findByEmail(email, (err, adminResult) => {
      if (err) throw err;

      if (adminResult.length > 0) {
        const admin = adminResult[0];

        bcrypt.compare(password, admin.password, (compareErr, match) => {
          if (compareErr) throw compareErr;

          if (!match) {
            req.session.message = {
              type: "error",
              text: "Password admin salah!",
            };
            return req.session.save(() => res.redirect("/login"));
          }

          req.session.admin = {
            id: admin.id,
            username: admin.username,
            email: admin.email,
          };
          req.session.message = {
            type: "success",
            text: "Selamat datang Admin!",
          };

          return req.session.save(() => res.redirect("/dashboard"));
        });

        return;
      }

      User.findByEmail(email, (userErr, userResult) => {
        if (userErr) throw userErr;

        if (userResult.length === 0) {
          req.session.message = {
            type: "error",
            text: "Email tidak terdaftar.",
          };
          return req.session.save(() => res.redirect("/login"));
        }

        const user = userResult[0];

        bcrypt.compare(password, user.password, (compareErr, match) => {
          if (compareErr) throw compareErr;

          if (!match) {
            req.session.message = {
              type: "error",
              text: "Password salah!",
            };
            return req.session.save(() => res.redirect("/login"));
          }

          if (user.status === "inactive") {
            User.reactivate(user.id, (reactivateErr) => {
              if (reactivateErr) throw reactivateErr;
            });
          }

          User.updateLastLogin(user.id, (loginErr) => {
            if (loginErr) throw loginErr;
          });

          req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
          };
          req.session.message = {
            type: "success",
            text: "Berhasil login!",
          };

          return req.session.save(() => res.redirect("/"));
        });
      });
    });
  },

  registerPage: async (req, res) => {
    const message = req.session.message || null;
    req.session.message = null;

    const content = await ejs.renderFile(
      path.join(__dirname, "../../views/pages/auth/register.ejs"),
      { message },
    );

    res.render("layouts/auth", {
      title: "Register | Lably",
      meta: "",
      style: "",
      content,
    });
  },

  register: (req, res) => {
    const { username, email, password } = req.body;

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) throw err;

      const newUser = {
        username,
        email,
        password: hash,
        pp_image: "/assets/profile.jpg",
      };

      User.create(newUser, (createErr) => {
        if (createErr) {
          req.session.message = {
            type: "error",
            text: "Gagal register! Email sudah digunakan.",
          };
          return req.session.save(() => res.redirect("/register"));
        }

        req.session.message = {
          type: "success",
          text: "Registrasi berhasil! Silakan login.",
        };
        return req.session.save(() => res.redirect("/login"));
      });
    });
  },

  logout: (req, res) => {
    req.session.destroy(() => {
      res.redirect("/login");
    });
  },
};
