import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext"; 
import "react-toastify/dist/ReactToastify.css";
import "../css/Book.css";

const Book = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [description, setDescription] = useState("Loading description...");
  const [quantity, setQuantity] = useState(1);

  const { auth } = useContext(AuthContext);
  const { addToCart } = useCart(); 
  const user = auth.user;

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/books/${id}`);
        const data = await res.json();
        setBook(data);
      } catch (err) {
        console.error("Error fetching book:", err);
      }
    };

    fetchBook();
  }, [id]);

  useEffect(() => {
    const fetchDescription = async () => {
      if (book) {
        try {
          const res = await fetch(
            `https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(
              book.title
            )}+inauthor:${encodeURIComponent(book.author)}`
          );
          const data = await res.json();

          if (
            data.items &&
            data.items.length > 0 &&
            data.items[0].volumeInfo.description
          ) {
            let desc = data.items[0].volumeInfo.description;

            const lines = desc.split(/\n|\r/).filter(Boolean);
            const cleanLines = lines.filter(
              (line) =>
                !line.toLowerCase().includes("PRE-ORDER") &&
                !line.toLowerCase().includes("NOW") &&
                !line.match(/^[A-Z\s\*\-\,\'\"]{10,}$/)
            );
            const cleanedDescription = cleanLines.length
              ? cleanLines.join(" ")
              : desc;

            setDescription(cleanedDescription);
          }
        } catch (err) {
          console.error("Error fetching description from Google Books:", err);
          setDescription("Error fetching description.");
        }
      }
    };

    fetchDescription();
  }, [book]);

  // Add to Cart handler
  const handleAddToCart = () => {
    if (!user) {
      toast.info("Please log in to add items to cart.");
      return;
    }
    addToCart({ ...book, quantity });
    toast.success("Book added to cart!");
  };

  // Order Now handler (unchanged)
  const handleOrder = async () => {
    if (!user) {
      toast.info("Please log in to place an order.");
      return;
    }

    const orderDetails = {
      bookId: book._id,
      userId: user.id,
      quantity,
      price: book.price * quantity,
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderDetails),
      });

      if (!res.ok) {
        throw new Error("Failed to create order");
      }

      const data = await res.json();

      if (data._id) {
        toast.success("Order placed successfully!");
      }
    } catch (err) {
      console.log(err);
      console.error("Error placing order:", err);
      toast.error(`Failed to place the order: ${err.message}`);
    }
  };

  if (!book) {
    return <div className="book-page">Loading...</div>;
  }

  return (
    <div className="book-page">
      {/* Toast Notifications */}
      <ToastContainer position="top-right" />

      <div className="book-container">
        <img
          src={book.imageUrl}
          alt={book.title}
          className="book-cover"
        />
        <div className="book-details">
          <h1>{book.title}</h1>
          <p className="author">by {book.author}</p>
          <p className="price">Price: ₹{book.price}</p>
          <p className="author">Book Type: {book.bookType}</p>

          {/* Quantity Selector */}
          <div className="quantity-selector">
            <label htmlFor="quantity">Quantity: </label>
            <select
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          <p className="description">{description}</p>

          <div className="book-buttons">
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Book;
