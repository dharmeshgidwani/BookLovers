const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController");

router.get("/get/:id", getUserProfile);

router.put("/update/:id", updateUserProfile);

module.exports = router;
