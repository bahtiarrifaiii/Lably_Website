const express = require("express");
const upload = require("../config/upload");
const catalogueController = require("../controllers/user/catalogueController");
const loanController = require("../controllers/user/loanController");
const cartController = require("../controllers/user/cartController");
const profileController = require("../controllers/user/profileController");
const {
  isLoggedIn,
  ensureVerifiedCustomer,
  passLoginStatus,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// Public & Catalogue
router.get("/", passLoginStatus, catalogueController.home);
router.get("/api/best-items", catalogueController.bestItemsApi);
router.get("/api/availability", catalogueController.availabilityApi);
router.get("/catalogue", catalogueController.catalogue);
router.post("/hide-reminder", catalogueController.hideReminder);
router.get(
  "/product/:id",
  isLoggedIn,
  passLoginStatus,
  catalogueController.productDetail,
);

// Loan Form & Submission
router.get(
  "/form",
  isLoggedIn,
  passLoginStatus,
  ensureVerifiedCustomer,
  loanController.formPage,
);
router.post(
  "/submit-data",
  isLoggedIn,
  ensureVerifiedCustomer,
  loanController.submitData,
);

// Cart, Checkout & Payment Previews
router.get(
  "/cart",
  isLoggedIn,
  passLoginStatus,
  ensureVerifiedCustomer,
  cartController.cartPage,
);
router.post("/cart/remove", isLoggedIn, cartController.removeFromCart);
router.post("/cart/clear", isLoggedIn, cartController.clearCart);
router.get(
  "/checkout",
  isLoggedIn,
  passLoginStatus,
  ensureVerifiedCustomer,
  cartController.checkoutPage,
);
router.get("/payment/qris", passLoginStatus, cartController.qrisPage);
router.post("/checkout/cancel", isLoggedIn, cartController.cancelCheckout);
router.post(
  "/checkout/complete",
  isLoggedIn,
  ensureVerifiedCustomer,
  cartController.completeCheckout,
);
router.get(
  "/notif-checkout",
  isLoggedIn,
  passLoginStatus,
  cartController.notifCheckout,
);
router.get("/preview/ewallet", passLoginStatus, cartController.previewEwallet);
router.get(
  "/preview/ewallet-qr",
  passLoginStatus,
  cartController.previewEwalletQr,
);

// Customer Orders & Profile
router.get(
  "/order-user",
  isLoggedIn,
  passLoginStatus,
  profileController.ordersPage,
);
router.get(
  "/order-detail/:id",
  isLoggedIn,
  passLoginStatus,
  profileController.orderDetailPage,
);
router.get(
  "/receipt/:id",
  isLoggedIn,
  passLoginStatus,
  profileController.receiptPage,
);
router.get(
  "/dashboard-customer",
  isLoggedIn,
  passLoginStatus,
  profileController.dashboardPage,
);
router.get(
  "/profile-customer",
  isLoggedIn,
  passLoginStatus,
  profileController.profilePage,
);
router.post(
  "/profile-customer/update",
  isLoggedIn,
  profileController.updateProfile,
);
router.post(
  "/profile-customer/upload-ktp",
  isLoggedIn,
  upload.single("ktp_image"),
  profileController.uploadKtp,
);
router.post(
  "/profile-customer/change-photo",
  isLoggedIn,
  upload.single("profile_image"),
  profileController.changePhoto,
);
router.post(
  "/profile-customer/change-password",
  isLoggedIn,
  profileController.changePassword,
);
router.post(
  "/profile-customer/change-email",
  isLoggedIn,
  profileController.changeEmail,
);

module.exports = router;
