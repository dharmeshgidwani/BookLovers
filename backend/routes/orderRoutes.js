const express = require("express");
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus,getOrdersByUserId } = require("../controllers/orderController");

router.post("/create", createOrder);

router.get("/", getOrders);

router.put("/:id", updateOrderStatus);

router.get("/user/:userId", getOrdersByUserId);

module.exports = router;
