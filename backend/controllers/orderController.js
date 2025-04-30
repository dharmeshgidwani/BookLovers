const Order = require("../models/Order");
const Book = require("../models/Book");

const createOrder = async (req, res) => {
  const { userId, books, totalPrice } = req.body;

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
      amountPaid: 0, 
      amountPending: totalPrice,
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

const addBookToOrder = async (req, res) => {
  const { orderId } = req.params;
  const { bookId, quantity } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    const existingBookIndex = order.books.findIndex(b => b.bookId.toString() === bookId);

    if (existingBookIndex >= 0) {
      order.books[existingBookIndex].quantity += quantity;
    } else {
      order.books.push({
        bookId,
        title: book.title,
        price: book.price,
        quantity,
      });
    }

    // Recalculate totalPrice
    let newTotal = 0;
    for (const item of order.books) {
      const bookInfo = await Book.findById(item.bookId);
      if (!bookInfo) continue;
      newTotal += bookInfo.price * item.quantity;
    }
    order.totalPrice = newTotal;

    order.statusHistory.push({
      status: "Book Added",
      changedAt: new Date(),
    });

    const updatedOrder = await order.save();
    res.status(200).json({ message: "Book added to order", order: updatedOrder });
  } catch (err) {
    console.error("Error adding book to order:", err);
    res.status(500).json({ message: "Error adding book to order", error: err.message });
  }
};

const updateOrderDetails = async (req, res) => {
  const { orderId } = req.params; // Extract the orderId from URL parameters
  const { updatedBooks, amountPaid } = req.body; // Extract updatedBooks and amountPaid from the request body

  try {
    // Find the order by its ID
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Validate each book in the updatedBooks array
    for (const item of updatedBooks) {
      const book = await Book.findById(item.bookId);
      if (!book) return res.status(404).json({ message: `Book not found: ${item.bookId}` });

      // Check if the quantity is available in stock
      if (item.quantity > book.stock) {
        return res.status(400).json({ message: `Not enough stock for ${book.title}` });
      }
    }

    // Update the order's books with the new data
    order.books = updatedBooks;

    // Calculate the new total price
    let newTotal = 0;
    for (const item of updatedBooks) {
      const book = await Book.findById(item.bookId);
      newTotal += book.price * item.quantity;
    }
    order.totalPrice = newTotal;

    // Update the amount paid, or use the existing value if not provided
    const paid = typeof amountPaid === "number" ? amountPaid : order.amountPaid;
    order.amountPaid = paid;
    order.amountPending = newTotal - paid; // Calculate the remaining balance

    // Add a status history for the update
    order.statusHistory.push({
      status: "Order Updated",
      changedAt: new Date(),
    });

    // Save the updated order
    const updatedOrder = await order.save();
    res.status(200).json({ message: "Order updated successfully", order: updatedOrder });

  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Error updating order", error: error.message });
  }
};

const updateAmountPaid = async (req, res) => {
  try {
    const { amountPaid, amountPending } = req.body;
    const orderId = req.params.orderId;

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: { amountPaid, amountPending } },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order amount details:", error);
    res.status(500).json({ message: "Error updating amount details", error });
  }
};

module.exports = { createOrder, getOrders, updateOrderStatus,getOrdersByUserId,addBookToOrder,updateOrderDetails,updateAmountPaid };
