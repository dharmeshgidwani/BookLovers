const express = require("express");
const router = express.Router();
const { signup, login,resetPassword,checkUser } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/check-user", checkUser);
router.post("/reset-password", resetPassword);


module.exports = router;
