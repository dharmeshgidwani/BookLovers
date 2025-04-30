const express = require("express");
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus,getOrdersByUserId,addBookToOrder,updateOrderDetails,updateAmountPaid } = require("../controllers/orderController");

router.post("/create", createOrder);

router.get("/", getOrders);

router.put("/:id", updateOrderStatus);

router.get("/user/:userId", getOrdersByUserId);

router.put("/:orderId/add-book", addBookToOrder);

router.put('/:orderId/update', updateOrderDetails);

router.put('/:orderId/updateAmountPaid', updateAmountPaid);


module.exports = router;
