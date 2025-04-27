import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../css/Profile.css"

const Profile = () => {
  const { auth } = useContext(AuthContext);
  const user = auth?.user || JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user || !user.id) {
      navigate("/login");
      return;
    }

    setFormData({ name: user.name, email: user.email, address: user.address });

    const fetchOrders = async () => {
      try {
        const res = await fetch(`http://localhost:5001/api/orders/user/${user.id}`);
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
      const res = await fetch(`http://localhost:5001/api/users/update/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      alert("Profile updated!");
      setEditMode(false);
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update profile.");
    }
  };
  console.log(formData)

  return (
    <div className="profile-page">
      <h2>User Profile</h2>

      {editMode ? (
        <div className="edit-form">
          <input name="name" value={formData.name} onChange={handleChange} />
          <input name="email" value={formData.email} onChange={handleChange} />
          <input name="address" value={formData.address} onChange={handleChange} />
          <button onClick={handleSave}>Save</button>
        </div>
      ) : (
        <div className="user-details">
          <p><strong>Name:</strong> {formData.name}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Address:</strong>{formData.address}</p>
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
              <p><strong>Order ID:</strong> {order._id}</p>
              <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Total:</strong> ₹{order.totalPrice}</p>
              <p><strong>Status:</strong>{order.status} </p>
              <p>
                        <strong>Last Status Update:</strong>{" "}
                        {(() => {
                          const lastStatusUpdate =
                            order.statusHistory[order.statusHistory.length - 1];
                          const dateTime = lastStatusUpdate.changedAt; 
                          const date = new Date(dateTime);
                          return !isNaN(date.getTime())
                            ? date.toLocaleString() 
                            : "Invalid date"; 
                        })()}
                      </p>
              <ul>
                {order.books.map((book, idx) => (
                  <li key={idx}>
                    <p><strong>Title:</strong> {book.bookId.title}</p>
                    <p><strong>Quantity:</strong> {book.quantity}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Profile;
