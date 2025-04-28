import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartInitialized, setCartInitialized] = useState(false);
  const hasFetchedInitialCart = useRef(false); 
  const { auth } = useContext(AuthContext);

  console.log(auth?.user?.id)

  useEffect(() => {  
    const fetchCart = async () => {
      if (!auth?.user?.id) {
        console.error("User not authenticated or user id is undefined");
        return;
      }
      else{
        console.log("User found")
      }
  
      try {
        const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/cart/${auth.user.id}`);
        const data = await res.json();
  
        if (Array.isArray(data)) {
          setCartItems(data.map(item => ({
            ...item,
            bookId: item._id,
          })));
        }
        else {
          console.warn("Cart fetch returned invalid data:", data);
          setCartItems([]);
        }
  
        hasFetchedInitialCart.current = true;
        setCartInitialized(true);
      } catch (err) {
        console.error("Error fetching cart:", err);
        hasFetchedInitialCart.current = true;
        setCartInitialized(true);
      }
    };
  
    fetchCart();
  }, [auth?.user?.id]);  // Fetch cart whenever the user changes
  

  // Synchronize cart with backend when cart items change
  useEffect(() => {
    if (!cartInitialized || !auth?.user?.id || !auth?.token) return;
    if (!hasFetchedInitialCart.current) return; // Only sync after initial fetch

    if (!cartItems.length) return; // Don't update if the cart is empty

    const updateCart = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/cart/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({
            userId: auth.user.id,
            cartItems: Array.isArray(cartItems) ? cartItems : [],
          }),
        });

        if (!res.ok) throw new Error("Failed to update cart");

      } catch (err) {
        console.error("❌ Error updating cart:", err);
      }
    };

    const timeout = setTimeout(() => {
      updateCart(); // Update after a small delay to prevent too many requests
    }, 300);

    return () => clearTimeout(timeout); // Clean up the timeout on unmount or dependency change
  }, [cartItems, auth?.user?.id, auth?.token, cartInitialized]);

  // Add a book to the cart, updating quantity if it exists
  const addToCart = (book) => {
    if (!book?._id || !cartInitialized) return;

    setCartItems((prev) => {
      const exists = prev.find((item) => item.bookId === book._id);
      return exists
        ? prev.map((item) =>
            item.bookId === book._id
              ? { ...item, quantity: item.quantity + book.quantity }
              : item
          )
        : [...prev, { bookId: book._id, quantity: 1 }];
    });
  };

  // Remove a book from the cart by its bookId
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.bookId !== id));
  };

  // Clear the entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        clearCart,
        cartInitialized,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
