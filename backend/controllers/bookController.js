const Book = require("../models/Book");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const cloudinary = require("cloudinary").v2;

require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "book_images", 
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw error; 
  }
};

exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (err) {
    console.error("Error fetching books:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Book not found" });
    res.status(200).json(book);
  } catch (err) {
    console.error("Error fetching book by ID:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.addBook = async (req, res) => {
  try {
    const { title, author, genre, price, mrp, weight, stock, bookType } = req.body;

    const existingBook = await Book.findOne({ title, author });
    if (existingBook) {
      return res.status(400).json({ message: "Book already exists with the same title and author" });
    }

    let imageUrl;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.path);
    }

    const newBookData = {
      title,
      bookType,
      author,
      genre,
      price,
      mrp,
      weight,
      stock,
      imageUrl,
    };

    const newBook = new Book(newBookData);

    await newBook.save();

    res.status(201).json({ message: "Book added successfully", book: newBook });
  } catch (err) {
    console.error("Error adding book:", err.message);
    res.status(500).json({ error: err.message });
  }
};


exports.updateBook = async (req, res) => {
  try {

    const { title, author, genre, price, mrp, stock, bookType, weight } = req.body;

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (bookType !== undefined) updateData.bookType = bookType;
    if (author !== undefined) updateData.author = author;
    if (genre !== undefined) updateData.genre = genre;
    
    if (price !== undefined && price !== "null") updateData.price = Number(price);
    if (mrp !== undefined && mrp !== "null") updateData.mrp = Number(mrp);
    if (weight !== undefined && weight !== "null") updateData.weight = Number(weight);
    if (stock !== undefined && stock !== "null") updateData.stock = Number(stock);    

    // If there's an image, upload it to Cloudinary
    if (req.file) {
      const imageUrl = await uploadToCloudinary(req.file.path);
      updateData.imageUrl = imageUrl; // Update the image URL with Cloudinary's URL
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json(updatedBook);
  } catch (err) {
    console.error("Error updating book:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.status(200).json({ message: "Book deleted successfully" });
  } catch (err) {
    console.error("Error deleting book:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.checkStock = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (book.stock > 0) {
      return res.status(200).json({ inStock: true, stock: book.stock });
    } else {
      return res.status(200).json({ inStock: false });
    }
  } catch (err) {
    console.error("Error checking stock:", err.message);
    res.status(500).json({ error: err.message });
  }
};

