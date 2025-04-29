import React, { useContext, useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../css/Cart.css";
import { ToastContainer, toast } from "react-toastify";


const Cart = () => {
  const { cartItems, setCartItems, clearCart, cartInitialized } = useCart();
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const user = auth?.user || JSON.parse(localStorage.getItem("user"));

  const [isOrderPlaced, setisOrderPlaced] = useState(false)

  const totalAmount = cartItems?.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const fetchBookDetails = async (bookId) => {
    if (!bookId) return {}; 
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/api/books/${bookId}`
      );
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
      toast.warn("Your cart is empty");
      return;
    }
  
    if (!user || !user.id) {
      toast.error("Please log in to place an order.");
      navigate("/login");
      return;
    }
  
    // Validate stock availability
    const books = await Promise.all(
      cartItems.map(async (item) => {
        if (!item._id || !item.quantity || item.quantity <= 0) {
          toast.error("Invalid book data found in your cart.");
          throw new Error("Invalid book data found");
        }
  
        // Fetch the current stock from the server
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_URL}/api/books/${item._id}`
        );
        const bookData = await response.json();
  
        // If stock is less than required quantity, show an error toast
        if (bookData.stock < item.quantity) {
          toast.error(`Not enough stock for "${item.title}". Only ${bookData.stock} left.`);
          throw new Error(`Not enough stock for "${item.title}". Only ${bookData.stock} left.`);
        }
  
        return {
          bookId: item._id,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
        };
      })
    );
  
    const totalPrice = books.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/api/orders/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            books,
            totalPrice,
          }),
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to place the order.");
      }
  
      clearCart();
      toast.success("Order placed successfully!");
      setisOrderPlaced(true);
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Something went wrong while placing the order. Please try again.");
    }
  };
  

  // Render cart
  if (!cartInitialized) return <div>Loading...</div>;

  console.log("cartItems", cartItems);

  return (
    <div className="cart">
    <ToastContainer position="top-right" autoClose={3000} />

    {isOrderPlaced && (
      <div className="order-success-message">
        <p>
          🎉 Your order is placed! Our admin will contact you on your WhatsApp number for payment details.
        </p>
      </div>
    )}
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <img src="/empty-cart.png" alt="Empty Cart" />
          <h3>Your cart is feeling lonely!</h3>
          <p>Looks like you haven't added anything yet.</p>
          <button onClick={() => navigate("/")}>Go to Shop</button>
        </div>
      ) : (
        <>
          <ul>
            {cartItems.map((item) => (
              <li key={item.bookId} className="cart-item">
                <div className="cart-item-content">
                  <div className="cart-item-image">
                    <img src={item.imageUrl} alt={item.title} />
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
          <div className="cart-buttons">
            <button onClick={handleBuyNow}>Buy Now</button>
            <button onClick={clearCart}>Clear Cart</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
