const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const adminRoutes = require("./adminRoutes");

const router = express.Router();

router.use("/", authRoutes);
router.use("/", userRoutes);
router.use("/", adminRoutes);

module.exports = router;
