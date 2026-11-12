const express = require("express");
const {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} = require("../controllers/doctorController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.route("/").get(getDoctors).post(createDoctor);
router.route("/:id").get(getDoctorById).put(updateDoctor).delete(deleteDoctor);

module.exports = router;
