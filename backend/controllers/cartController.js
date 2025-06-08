const User = require("../models/User");
const Book = require("../models/Book");
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;

exports.getCart = async (req, res) => {
  const userId = req.params.userId;

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId); 
    const user = await User.findById(userObjectId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const cartWithDetails = await Promise.all(
      user.cart.map(async (item) => {
        const book = await Book.findById(item.bookId);
        if (!book) {
          return null;
        }

        return {
          _id: book._id,
          title: book.title,
          author: book.author,
          imageUrl: book.imageUrl,
          price: book.price,
          quantity: item.quantity
        };
      })
    );

    const validCartItems = cartWithDetails.filter(item => item !== null);

    res.status(200).json(validCartItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Error fetching cart." });
  }
};


exports.updateCart = async (req, res) => {
  const { userId, cartItems } = req.body;

  try {

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },  
      { $set: { cart: cartItems } },  
      { new: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "Cart updated successfully.", cart: updatedUser.cart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Error updating cart." });
  }
};

exports.removeItemFromCart = async (req, res) => {
  const { userId, bookId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found." });

    // Filter out the item to remove
    user.cart = user.cart.filter(
      (item) => item.bookId.toString() !== bookId.toString()
    );

    await user.save();

    res.status(200).json({ message: "Item removed from cart.", cart: user.cart });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Error removing item from cart." });
  }
};

exports.clearCart = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found." });

    user.cart = [];
    await user.save();

    res.status(200).json({ message: "Cart cleared successfully." });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ message: "Error clearing cart." });
  }
};
