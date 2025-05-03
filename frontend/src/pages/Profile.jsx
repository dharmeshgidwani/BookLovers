import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "../css/Profile.css";
import { toast } from "react-toastify";

const Profile = () => {
  const { auth } = useContext(AuthContext);
  const user = auth?.user || JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [orders, setOrders] = useState([]);
  const [editOrderId, setEditOrderId] = useState(null);
  const [editableOrder, setEditableOrder] = useState(null);
  const [newBookId, setNewBookId] = useState("");
  const [newBookQty, setNewBookQty] = useState(1);
  const [originalOrderBooks, setOriginalOrderBooks] = useState(null);


  useEffect(() => {
    if (!user || !user.id) {
      navigate("/login");
      return;
    }

    setFormData({ name: user.name, email: user.email, address: user.address });

    const fetchOrders = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_APP_API_URL}/api/orders/user/${user.id}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch orders");
        setOrders(data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Save updated profile
  const handleSave = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/api/users/update/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      alert("Profile updated!");
      setEditMode(false);
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update profile.");
    }
  };

  const handleEditOrder = (order) => {
    setEditOrderId(order._id);
  
    const formattedBooks = order.books.map((book) => ({
      bookId: typeof book.bookId === "object" ? book.bookId._id : book.bookId,
      title: book.title,
      price: book.price,
      quantity: book.quantity,
    }));
  
    setEditableOrder(formattedBooks);
    setOriginalOrderBooks(formattedBooks); 
  };
  

  const handleQuantityChange = (index, newQty) => {
    const updatedBooks = [...editableOrder];
    updatedBooks[index].quantity = parseInt(newQty);
    setEditableOrder(updatedBooks);
  };

  const handleRemoveBook = (index) => {
    const updatedBooks = [...editableOrder];
    updatedBooks.splice(index, 1);
    setEditableOrder(updatedBooks);
  };

  const handleSaveOrder = async (orderId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/api/orders/${orderId}/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            updatedBooks: editableOrder,
            originalBooks: originalOrderBooks, // 👈 Send original snapshot
          }),
        }
      );
  
      const data = await res.json();
      if (!res.ok) {
        if (data.message.includes("insufficient stock")) {
          throw new Error("Insufficient stock for some items in the order");
        }
        throw new Error(data.message || "Failed to update order");
      }
  
      toast.success("Order updated!");
      setEditOrderId(null);
      setEditableOrder(null);
      setOriginalOrderBooks(null); 
      const refreshed = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/api/orders/user/${user.id}`
      );
      const updatedData = await refreshed.json();
      setOrders(updatedData || []);
    } catch (err) {
      console.error("Error updating order:", err);
      if (err.message === "Insufficient stock for some items in the order") {
        toast.error("Some items in your order are out of stock.");
      } else {
        toast.error("Failed to update order.");
      }
    }
  };
  
  
  
  

  return (
    <div className="profile-page">
      <h2>User Profile</h2>

      {editMode ? (
        <div className="edit-form">
          <input name="name" value={formData.name} onChange={handleChange} />
          <input name="email" value={formData.email} onChange={handleChange} />
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
          <button onClick={handleSave}>Save</button>
        </div>
      ) : (
        <div className="user-details">
          <p>
            <strong>Name:</strong> {formData.name}
          </p>
          <p>
            <strong>Email:</strong> {formData.email}
          </p>
          <p>
            <strong>Address:</strong>
            {formData.address}
          </p>
          <button onClick={() => setEditMode(true)}>Edit</button>
        </div>
      )}

      <hr />
      <h3 className="order-h3">Your Orders</h3>
      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <ul className="order-history">
          {orders.map((order) => (
            <li key={order._id} className="order-card">
              <p>
                <strong>Order ID:</strong> {order._id}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p>
                <strong>Total:</strong> ₹{order.totalPrice}
              </p>
              <p>
                <strong>Amount Pending:</strong> ₹{order.amountPending}
              </p>
              <p>
                <strong>Amount Paid:</strong> ₹{order.amountPaid}
              </p>
              <p>
                <strong>Status:</strong>
                {order.status}{" "}
              </p>
              <p>
                <strong>Last Status Update:</strong>{" "}
                {(() => {
                  const lastStatusUpdate =
                    order.statusHistory && order.statusHistory.length > 0
                      ? order.statusHistory[order.statusHistory.length - 1]
                      : null;

                  if (lastStatusUpdate) {
                    const dateTime = lastStatusUpdate.changedAt;
                    const date = new Date(dateTime);
                    return !isNaN(date.getTime())
                      ? date.toLocaleString()
                      : "Invalid date";
                  }
                  return "No status updates";
                })()}
              </p>

              {editOrderId === order._id ? (
                <div className="edit-order-section">
                  {editableOrder.map((book, idx) => (
                    <div key={idx} className="editable-book">
                      <p>
                        <strong>Book ID:</strong> {book.bookId}
                      </p>
                      <p>
                        <strong>Title:</strong> {book.title}
                      </p>
                      <label>
                        Quantity:
                        <input
                          type="number"
                          min={1}
                          value={book.quantity}
                          onChange={(e) =>
                            handleQuantityChange(idx, e.target.value)
                          }
                        />
                      </label>
                      <button onClick={() => handleRemoveBook(idx)}>
                        Remove
                      </button>
                      <hr />
                    </div>
                  ))}

                  <button onClick={() => handleSaveOrder(order._id)}>
                    Save Order
                  </button>
                  <button onClick={() => setEditOrderId(null)}>Cancel</button>
                </div>
              ) : (
                <>
                  <ul>
                    {order.books.map((book, idx) => (
                      <li key={idx}>
                        <p>
                          <strong>Title:</strong> {book.bookId.title}
                        </p>
                        <p>
                          <strong>Quantity:</strong> {book.quantity}
                        </p>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleEditOrder(order)}
                    className="btn"
                  >
                    Edit Order
                  </button>
                  <Link
                    to="/"
                    state={{ activeOrderId: order._id }}
                    className="btn"
                  >
                    Add More Books
                  </Link>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Profile;
