// ./middlewares/authMiddleware.js (REVISI)

// 1. Middleware Otentikasi Umum (Admin atau Customer)
const isLoggedIn = (req, res, next) => {
  // Cek apakah sesi user ATAU sesi admin ada
  if (req.session.user || req.session.admin) {
    return next();
  }

  req.session.message = {
    type: "error",
    text: "Anda harus login untuk mengakses halaman ini.",
  };

  req.session.save(() => {
    return res.redirect("/login");
  });
};

// 2. Middleware Otorisasi (Khusus Admin)
const isAdmin = (req, res, next) => {
  // Cek apakah sesi admin ADA
  if (req.session.admin) {
    return next();
  }

  // Jika tidak ada sesi admin, arahkan mereka ke halaman utama user atau login
  req.session.message = {
    type: "error",
    text: "Akses Ditolak: Anda tidak memiliki izin Admin.",
  };

  req.session.save(() => {
    // Redirect ke dashboard user atau login jika tidak ada sesi sama sekali
    return res.redirect(req.session.user ? "/" : "/login");
  });
};

// 3. Middleware untuk Header (tetap sama)
const passLoginStatus = (req, res, next) => {
  // isLoggedIn status menjadi true jika ada sesi user ATAU admin
  res.locals.isLoggedIn = !!req.session.user || !!req.session.admin;
  res.locals.userSession = req.session.user || req.session.admin || null;
  res.locals.isAdmin = !!req.session.admin; // Tambahkan status admin untuk header
  next();
};

module.exports = {
  isLoggedIn, // Dipakai untuk rute Customer
  isAdmin, // Dipakai untuk rute Admin
  passLoginStatus,
};
