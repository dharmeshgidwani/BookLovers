import React, { useContext, useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../css/Cart.css";

const Cart = () => {
  const { cartItems, setCartItems, clearCart, cartInitialized } = useCart();
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const user = auth?.user || JSON.parse(localStorage.getItem("user"));

  const totalAmount = cartItems?.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const fetchBookDetails = async (bookId) => {
    if (!bookId) return {}; // Return an empty object if bookId is not provided
    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/books/${bookId}`);
      const bookData = await response.json();
      if (!response.ok)
        throw new Error(bookData.message || "Error fetching book details");
      return bookData;
    } catch (error) {
      console.error("Error fetching book details:", error);
      return {}; // Return an empty object on error to prevent breaking the cart
    }
  };

  useEffect(() => {
    const fetchCartWithDetails = async () => {
      const updatedCart = await Promise.all(
        cartItems.map(async (item) => {
          if (item.title && item.author && item.price) return item;
          const fullBookDetails = await fetchBookDetails(item.bookId);
          return {
            ...item,
            ...fullBookDetails,
          };
        })
      );
      setCartItems(updatedCart);
    };
      if (cartInitialized && user && user.id && cartItems.length > 0) {
      fetchCartWithDetails();
    }
  }, [cartInitialized, user, cartItems.length]);
  

  // Remove item from cart
  const handleRemoveFromCart = async (itemId) => {
    const updatedCart = cartItems.filter((item) => item.bookId !== itemId);
    setCartItems(updatedCart);
    // Optionally, update the cart in the database as well
  };

  const handleBuyNow = async () => {
    if (!cartItems.length) {
      alert("Your cart is empty!");
      return;
    }

    if (!user || !user.id) {
      alert("Please log in to place an order.");
      navigate("/login");
      return;
    }

    const books = cartItems.map((item) => {
      if (!item._id || !item.quantity || item.quantity <= 0) {
        alert("Invalid book data found in your cart.");
        throw new Error("Invalid book data found");
      }

      return {
        bookId: item._id,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
      };
    });

    const totalPrice = books.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    try {
      const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          books,
          totalPrice,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to place the order.");
      }

      clearCart();
      alert("Order placed successfully!");
    } catch (error) {
      console.error("Order error:", error);
      alert("Something went wrong while placing the order. Please try again.");
    }
  };


  // Render cart
  if (!cartInitialized) return <div>Loading...</div>;

  console.log("cartItems", cartItems);

  return (
    <div className="cart">
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <ul>
            {cartItems.map((item) => (
              <li key={item.bookId} className="cart-item">
                <div className="cart-item-content">
                  <div className="cart-item-image">
                    <img
                      src={`http://localhost:5001/${item.imageUrl}`}
                      alt={item.title}
                    />
                  </div>
                  <div className="cart-item-details">
                    <h4>{item.title}</h4>
                    <h5>by {item.author}</h5>
                    <p>Quantity: {item.quantity}</p>
                    <p>Price: ₹{item.price * item.quantity}</p>
                  </div>
                  <button onClick={() => handleRemoveFromCart(item.bookId)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <h3>Total: ₹{totalAmount}</h3>
          <button onClick={handleBuyNow}>Buy Now</button>
          <button onClick={clearCart}>Clear Cart</button>
        </>
      )}
    </div>
  );
};

export default Cart;
