const express = require("express");
const router = express.Router();
const { getCart, updateCart } = require("../controllers/cartController");

// Get the cart for a user
router.get("/:userId", getCart);

// Update the cart (add/remove items)
router.post("/", updateCart);

module.exports = router;
