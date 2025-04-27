const express = require("express");
const { getBooks, addBook, updateBook, deleteBook } = require("../controllers/bookController");
const { getInventory, updateInventory } = require("../controllers/inventoryController");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/books", adminMiddleware, getBooks);
router.post("/books", adminMiddleware, addBook);
router.put("/books/:id", adminMiddleware, updateBook);
router.delete("/books/:id", adminMiddleware, deleteBook);

router.get("/inventory", adminMiddleware, getInventory);
router.put("/inventory/:id", adminMiddleware, updateInventory);

module.exports = router;
