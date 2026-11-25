const express = require("express");
const upload = require("../config/upload");
const dashboardController = require("../controllers/admin/dashboardController");
const customerController = require("../controllers/admin/customerController");
const orderController = require("../controllers/admin/orderController");
const productController = require("../controllers/admin/productController");
const categoryController = require("../controllers/admin/categoryController");
const analyticsController = require("../controllers/admin/analyticsController");
const { isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

// Dashboard
router.get("/dashboard", isAdmin, dashboardController.dashboard);

// Customers
router.get("/customer", isAdmin, customerController.list);
router.get("/customer/:id", isAdmin, customerController.detail);
router.post("/customer/:id/approve-ktp", isAdmin, customerController.approveKtp);
router.post("/customer/:id/reject-ktp", isAdmin, customerController.rejectKtp);

// Orders
router.get("/order", isAdmin, orderController.list);
router.post("/order/approve/:id", isAdmin, orderController.approve);
router.post("/order/reject/:id", isAdmin, orderController.reject);
router.post("/order/complete/:id", isAdmin, orderController.complete);
router.post("/order/reminder/:id", isAdmin, orderController.sendReminder);
router.get("/order-completed", isAdmin, orderController.completedList);

// Products
router.get("/product-list", isAdmin, productController.list);
router.get("/product-create", isAdmin, productController.createPage);
router.post(
  "/product/create",
  isAdmin,
  upload.single("image"),
  productController.create,
);
router.get("/product-detail/:id", isAdmin, productController.detailPage);
router.post(
  "/product/update/:id",
  isAdmin,
  upload.single("image"),
  productController.update,
);
router.get("/product/delete/:id", isAdmin, productController.delete);

// Analytics & Invoice
router.get("/analytics", isAdmin, analyticsController.analytics);
router.get("/invoice", isAdmin, analyticsController.invoice);

// Categories
router.get("/category", isAdmin, categoryController.index);
router.get("/category/create", isAdmin, categoryController.createPage);
router.post("/category/create", isAdmin, categoryController.create);
router.get("/category/edit/:id", isAdmin, categoryController.editPage);
router.post("/category/update/:id", isAdmin, categoryController.update);
router.get("/category/delete/:id", isAdmin, categoryController.delete);

module.exports = router;
