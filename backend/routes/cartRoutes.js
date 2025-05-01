const express = require("express");
const router = express.Router();
const { getCart, updateCart,removeItemFromCart,clearCart } = require("../controllers/cartController");

// Get the cart for a user
router.get("/:userId", getCart);

// Update the cart (add/remove items)
router.post("/", updateCart);

router.delete("/:userId/:bookId", removeItemFromCart); 
router.delete("/:userId", clearCart);

module.exports = router;
