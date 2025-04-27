const Order = require("../models/Order");
const Book = require("../models/Book");

const createOrder = async (req, res) => {
  const { userId, books, totalPrice } = req.body;

  console.log("Received Order Data:", req.body);  

  try {
    for (const item of books) {
      const book = await Book.findById(item.bookId);
      if (!book) {
        return res.status(404).json({ message: `Book not found: ${item.bookId}` });
      }

      if (book.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${book.title}` });
      }

      book.stock -= item.quantity;
      await book.save();
    }

    const newOrder = new Order({
      userId,
      books,
      totalPrice,
      status: "Pending",
    });

    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ message: "Error placing order", error: err });
  }
};


const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('books.bookId')  
      .populate('userId')
      .exec();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error });
  }
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      changedAt: new Date(),
    });

    const updatedOrder = await order.save();

    res.status(200).json(updatedOrder); 
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Error updating order", error });
  }
};

const getOrdersByUserId = async (req, res) => {
  try {
    const userOrders = await Order.find({ userId: req.params.userId })
      .populate("books.bookId")
      .sort({ createdAt: -1 });

    res.status(200).json(userOrders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Error fetching user orders" });
  }
};



module.exports = { createOrder, getOrders, updateOrderStatus,getOrdersByUserId };
