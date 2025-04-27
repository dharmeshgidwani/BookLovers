const User = require("../models/User");
const Book = require("../models/Book");
const mongoose = require('mongoose');
const { ObjectId } = require('mongoose').Types;

exports.getCart = async (req, res) => {
  const userId = req.params.userId;
  console.log("Getting cart for userId:", userId); // ✅

  try {
    const userObjectId = new mongoose.Types.ObjectId(userId); 
    const user = await User.findById(userObjectId);

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found." });
    }

    console.log("User found:", user.name);
    console.log("User's cart:", user.cart); // ✅

    const cartWithDetails = await Promise.all(
      user.cart.map(async (item) => {
        const book = await Book.findById(item.bookId);
        if (!book) {
          console.log("Book not found for ID:", item.bookId); // ✅
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
    console.log("Returning cart items:", validCartItems); // ✅

    res.status(200).json(validCartItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Error fetching cart." });
  }
};


exports.updateCart = async (req, res) => {
  const { userId, cartItems } = req.body;

  try {
    console.log("Updating Cart for User ID:", userId);
    console.log("New Cart Items:", cartItems);

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },  
      { $set: { cart: cartItems } },  
      { new: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    console.log("Updated Cart:", updatedUser.cart);  

    res.status(200).json({ message: "Cart updated successfully.", cart: updatedUser.cart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ message: "Error updating cart." });
  }
};
