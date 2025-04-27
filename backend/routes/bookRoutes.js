const express = require("express");
const multer = require("multer");
const { getBooks, addBook, updateBook, deleteBook, getBookById } = require("../controllers/bookController");

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.get("/", getBooks);

router.post("/add", upload.single("image"), addBook);

router.put("/:id",upload.single("image"), updateBook);

router.delete("/:id", deleteBook);

router.get("/:id", getBookById);

module.exports = router;
