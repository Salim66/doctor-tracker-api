const express = require("express");
const authRoutes = require("./authRoutes");
const doctorRoutes = require("./doctorRoutes");
const patientRoutes = require("./patientRoutes");
const dashboardRoutes = require("./dashboardRoutes");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Doctor Tracker API is running",
  });
});

router.use("/auth", authRoutes);
router.use("/doctors", doctorRoutes);
router.use("/patients", patientRoutes);
router.use("/dashboard", dashboardRoutes);

module.exports = router;

