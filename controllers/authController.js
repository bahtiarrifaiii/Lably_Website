const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");

module.exports = {

    // ========================
    // LOGIN (ADMIN + USER)
    // ========================
    login: (req, res) => {
        const { email, password } = req.body;

        // Cek admin dulu
        Admin.findByEmail(email, (err, adminResult) => {
            if (err) throw err;

            if (adminResult.length > 0) {
                const admin = adminResult[0];

                bcrypt.compare(password, admin.password, (err, match) => {
                    if (!match) {
                        req.session.message = {
                            type: "error",
                            text: "Password admin salah!"
                        };
                        return res.redirect("/login");
                    }

                    // Login admin sukses
                    req.session.admin = {
                        id: admin.id,
                        username: admin.username,
                        email: admin.email
                    };

                    req.session.message = {
                        type: "success",
                        text: "Selamat datang Admin!"
                    };

                    return res.redirect("/dashboard"); // FIX
                });

                return;
            }

            // Kalau bukan admin cek user
            User.findByEmail(email, (err, userResult) => {
                if (err) throw err;

                if (userResult.length === 0) {
                    req.session.message = {
                        type: "error",
                        text: "Email tidak terdaftar."
                    };
                    return res.redirect("/login");
                }

                const user = userResult[0];

                bcrypt.compare(password, user.password, (err, match) => {
                    if (!match) {
                        req.session.message = {
                            type: "error",
                            text: "Password salah!"
                        };
                        return res.redirect("/login");
                    }

                    // Login user sukses
                    req.session.user = {
                        id: user.id,
                        username: user.username,
                        email: user.email
                    };

                    req.session.message = {
                        type: "success",
                        text: "Berhasil login!"
                    };

                    return res.redirect("/");
                });
            });
        });
    },


    // ========================
    // REGISTER USER
    // ========================
    register: (req, res) => {
        const { username, email, password } = req.body;

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) throw err;

            const newUser = { username, email, password: hash };

            User.create(newUser, (err) => {
                if (err) {
                    req.session.message = {
                        type: "error",
                        text: "Gagal register! Email sudah digunakan."
                    };
                    return res.redirect("/register");
                }

                req.session.message = {
                    type: "success",
                    text: "Registrasi berhasil! Silakan login."
                };

                return res.redirect("/login");
            });
        });
    }

};
