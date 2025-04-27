const Book = require("../models/Book");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

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
    console.log("Received book ID:", req.params.id); // Log the received ID
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
    console.log("Received data for new book:", req.body); // Log the received request body
    if (req.file) {
      console.log("Received file:", req.file); // Log the uploaded file if it exists
    }

    const { title, author, genre, price, mrp, weight, stock, bookType } = req.body;

    const newBookData = {
      title,
      bookType,
      author,
      genre,
      price,
      mrp,
      weight,
      stock,
    };

    if (req.file) {
      newBookData.imageUrl = req.file.path;
    }

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
    console.log("Received data for book update:", req.body); // Log the received data for updating the book
    console.log("Received file for update:", req.file); // Log the uploaded file if it exists

    const { title, author, genre, price, mrp, stock, bookType, weight } = req.body;

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (bookType !== undefined) updateData.bookType = bookType;
    if (author !== undefined) updateData.author = author;
    if (genre !== undefined) updateData.genre = genre;
    if (price !== undefined) updateData.price = price;
    if (mrp !== undefined) updateData.mrp = mrp;
    if (weight !== undefined) updateData.weight = weight;
    if (stock !== undefined) updateData.stock = stock;
    if (req.file) updateData.imageUrl = req.file.path;

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
    console.log("Received request to delete book with ID:", req.params.id); // Log the ID of the book to delete
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
