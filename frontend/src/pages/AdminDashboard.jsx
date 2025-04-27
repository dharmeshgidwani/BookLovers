import React, { useState, useEffect } from "react";
import "../css/AdminDashboard.css";

const AdminDashboard = () => {
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    mrp: "",
    price: "",
    genre: "",
    stock: "",
  });
  const [editingBookId, setEditingBookId] = useState(null);
  const [showBooks, setShowBooks] = useState(false);
  const [showOrders, setShowOrders] = useState(true);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    fetchBooks();
    fetchOrders();
  }, []);

  const fetchBooks = async () => {
    const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/books`);
    const data = await res.json();
    setBooks(data);
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/orders`);
      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setOrders([]);
    }
  };

  const pendingOrders = orders.filter((order) => order.status === "Pending");
  const shippedOrders = orders.filter((order) => order.status === "Shipped");

  const resetForm = () => {
    setNewBook({
      title: "",
      author: "",
      price: "",
      mrp:"",
      genre: "",
      stock: "",
      imageUrl: "",
    });
    setEditingBookId(null);
  };

  const handleAddOrUpdateBook = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", newBook.title);
    formData.append("author", newBook.author);
    formData.append("genre", newBook.genre);
    formData.append("mrp", newBook.mrp);
    formData.append("price", newBook.price);
    formData.append("stock", newBook.stock);
    formData.append("image", newBook.image);

    const url = editingBookId
      ? `${import.meta.env.VITE_APP_API_URL}/api/books/${editingBookId}`
      : `${import.meta.env.VITE_APP_API_URL}/api/books/add`;

    const method = editingBookId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      body: formData,
    });

    if (res.ok) {
      alert(`Book ${editingBookId ? "updated" : "added"} successfully!`);
      fetchBooks();
      resetForm();
    } else {
      alert("Error saving book");
    }
  };

  const handleDelete = async (bookId) => {
    const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/books/${bookId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      alert("Book deleted successfully!");
      fetchBooks();
    } else {
      alert("Error deleting book");
    }
  };

  // const handleUpdateStock = async (bookId, newStock) => {
  //   const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/books/${bookId}`, {
  //     method: "PUT",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ stock: newStock }),
  //   });

  //   if (res.ok) {
  //     alert("Stock updated successfully!");
  //     fetchBooks();
  //   } else {
  //     alert("Error updating stock");
  //   }
  // };

  const handleEdit = (book) => {
    setNewBook({
      title: book.title,
      author: book.author,
      genre: book.genre,
      price: book.price,
      mrp: book.mrp,
      stock: book.stock,
    });
    setEditingBookId(book._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOrderStatusUpdate = async (orderId, status) => {
    const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  
    if (res.ok) {
      alert("Order status updated successfully!");
      fetchOrders();
    } else {
      alert("Error updating order status.");
    }
  };
  

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      <div className="top-bar">
        <button
          onClick={() => {
            resetForm();
            setShowBooks(false);
            setShowOrders(false);
          }}
        >
          {editingBookId ? "Cancel Edit" : "Add New Book"}
        </button>

        <button
          onClick={() => {
            setShowBooks(true);
            setShowOrders(false);
          }}
        >
          {showBooks ? "Hide Books" : "View Books"}
        </button>

        <button
          onClick={() => {
            setShowOrders(true);
            setShowBooks(false);
          }}
        >
          {showOrders ? "Hide Orders" : "View Orders"}
        </button>
      </div>

      {/* Book Management Form */}
      {showForm && (
        <section className="book-form">
          <h3>{editingBookId ? "Edit Book" : "Add New Book"}</h3>
          <form onSubmit={handleAddOrUpdateBook}>
            <input
              type="text"
              placeholder="Title"
              value={newBook.title}
              onChange={(e) =>
                setNewBook({ ...newBook, title: e.target.value })
              }
              required
            />
            <input
              type="text"
              placeholder="Author"
              value={newBook.author}
              onChange={(e) =>
                setNewBook({ ...newBook, author: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Genre"
              value={newBook.genre}
              onChange={(e) =>
                setNewBook({ ...newBook, genre: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="MRP"
              value={newBook.mrp}
              onChange={(e) =>
                setNewBook({ ...newBook, mrp: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Price"
              value={newBook.price}
              onChange={(e) =>
                setNewBook({ ...newBook, price: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Stock"
              value={newBook.stock}
              onChange={(e) =>
                setNewBook({ ...newBook, stock: e.target.value })
              }
            />
            <input
              type="file"
              onChange={(e) =>
                setNewBook({ ...newBook, image: e.target.files[0] })
              }
            />
            <button type="submit">
              {editingBookId ? "Update Book" : "Add Book"}
            </button>
          </form>
        </section>
      )}

      {/* Books List */}
      {showBooks && (
        <section className="book-list">
          <h3>Books List</h3>
          <ul>
            {books.map((book) => (
              <li key={book._id}>
                <h4>
                  {book.title} by {book.author}
                </h4>
                <p>Genre: {book.genre}</p>
                <p>Price: ${book.price}</p>
                <p>Stock: {book.stock}</p>
                <button onClick={() => handleDelete(book._id)}>Delete</button>
                <button onClick={() => handleEdit(book)}>Edit</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Orders List */}
      {showOrders && (
        <section className="order-list">
          <h3>Pending Orders</h3>
          <ul>
            {pendingOrders.length === 0 ? (
              <p>No pending orders.</p>
            ) : (
              pendingOrders.map((order) => (
                <li key={order._id}>
                  <h4>Order #{order._id}</h4>
                  <div className="order-details">
                    <p>
                      <strong>Customer:</strong> {order.userId?.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {order.userId?.email}
                    </p>
                    <p>
                      <strong>Status:</strong> {order.status}
                    </p>
                    <p>
                      <strong>Total Price:</strong> ₹ {order.totalPrice}
                    </p>
                    <p>
                      <strong>Order Date:</strong>{" "}
                      {new Date(order.createdAt).toLocaleString()}
                    </p>

                    {order.statusHistory && order.statusHistory.length > 0 && (
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
                    )}
                  </div>
                  <div className="order-books">
                    <p>
                      <strong>Books:</strong>
                    </p>
                    <ul>
                      {order.books.map((book, index) => (
                        <li key={index}>
                          <strong>{book.title}</strong> 
                          <p>Quantity: {book.quantity}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="order-actions">
                    <label htmlFor={`status-${order._id}`}>
                      <strong>Update Status:</strong>
                    </label>
                    <select
                      id={`status-${order._id}`}
                      value={order.status}
                      onChange={(e) =>
                        handleOrderStatusUpdate(order._id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      )}
      {showOrders && (
        <section className="order-list">
          <h3>Shipped Orders List</h3>
          <ul>
            {orders.length === 0 ? (
              <p>No orders available.</p>
            ) : (
              shippedOrders.map((order) => (
                <li key={order._id}>
                  <h4>Order #{order._id}</h4>
                  <div className="order-details">
                    <p>
                      <strong>Customer:</strong> {order.userId.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {order.userId.email}
                    </p>
                    <p>
                      <strong>Address:</strong> {order.userId.address}
                    </p>
                    <p>
                      <strong>Status:</strong> {order.status}
                    </p>
                    <p>
                      <strong>Order Date:</strong>{" "}
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    {order.statusHistory && order.statusHistory.length > 0 && (
                      <p>
                        <strong>Last Status Update:</strong>{" "}
                        {(() => {
                          const lastStatusUpdate =
                            order.statusHistory[order.statusHistory.length - 1];
                          const dateTime = lastStatusUpdate.changedAt; // Use changedAt instead of dateTime

                          // If changedAt is a valid date object, format it
                          const date = new Date(dateTime);
                          return !isNaN(date.getTime())
                            ? date.toLocaleString() // Display in the local format
                            : "Invalid date"; // Handle invalid date
                        })()}
                      </p>
                    )}
                  </div>
                  <div className="order-books">
                    <p>
                      <strong>Books:</strong>
                    </p>
                    <ul>
                      {Array.isArray(order.books) && order.books.length > 0 ? (
                        order.books.map((book, index) => (
                          <li key={index}>
                            <strong>{book.title}</strong> (x{book.quantity}) - $
                            {book.price}
                          </li>
                        ))
                      ) : (
                        <p>No books found in this order.</p>
                      )}
                    </ul>
                  </div>
                  <div className="order-actions">
                    <label htmlFor={`status-${order._id}`}>
                      <strong>Update Status:</strong>
                    </label>
                    <select
                      id={`status-${order._id}`}
                      value={order.status}
                      onChange={(e) =>
                        handleOrderStatusUpdate(order._id, e.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      )}
    </div>
  );
};

export default AdminDashboard;
