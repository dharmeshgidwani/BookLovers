const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  bookType: String,
  author: String,
  genre: String,
  mrp: Number,
  weight: Number,
  price: Number,
  stock: Number,
  imageUrl: { type: String },
});

module.exports = mongoose.model("Book", bookSchema);
