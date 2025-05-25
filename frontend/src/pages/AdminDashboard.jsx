import React, { useState, useEffect } from "react";
import "../css/AdminDashboard.css";
import * as XLSX from "xlsx";

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
    bookType: "",
    weight: "",
    image: null,
  });
  const [editingBookId, setEditingBookId] = useState(null);
  const [showBooks, setShowBooks] = useState(false);
  const [showOrders, setShowOrders] = useState(true);
  const [showForm, setShowForm] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [amountPaid, setAmountPaid] = useState({});
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editedBooks, setEditedBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    fetchBooks();
    fetchOrders();
  }, []);

  const fetchBooks = async () => {
    const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/books`);
    const data = await res.json();
    setBooks(data);
    setAllBooks(data);
  };
  
  console.log("Book",books)

  const exportToExcel = () => {
    if (!books || books.length === 0) {
      alert('No books available to export.');
      return;
    }

    const formattedBooks = books.map(book => ({
      ID: book._id,
      Title: book.title,
      Author: book.author,
      Genre: book.genre,
      Price: book.price,
      Stock: book.stock,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedBooks);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Books');

    XLSX.writeFile(workbook, 'Books_Export.xlsx');
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
      mrp: "",
      genre: "",
      stock: "",
      imageUrl: "",
      bookType: "",
      weight: "",
    });
    setEditingBookId(null);
  };

  const handleAddOrUpdateBook = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    if (newBook.title) formData.append("title", newBook.title);
    if (newBook.bookType) formData.append("bookType", newBook.bookType);
    if (newBook.author) formData.append("author", newBook.author);
    if (newBook.genre) formData.append("genre", newBook.genre);
    if (newBook.mrp !== undefined) formData.append("mrp", newBook.mrp);
    if (newBook.weight !== undefined) formData.append("weight", newBook.weight);
    if (newBook.price !== undefined) formData.append("price", newBook.price);
    if (newBook.stock !== undefined) formData.append("stock", newBook.stock);
    if (newBook.image) formData.append("image", newBook.image);

    const url = editingBookId
      ? `${import.meta.env.VITE_APP_API_URL}/api/books/${editingBookId}`
      : `${import.meta.env.VITE_APP_API_URL}/api/books/add`;

    const method = editingBookId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert(`Book ${editingBookId ? "updated" : "added"} successfully!`);
        fetchBooks();
        resetForm();
      } else {
        alert(data.message || "Error saving book");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  const handleDelete = async (bookId) => {
    const res = await fetch(
      `${import.meta.env.VITE_APP_API_URL}/api/books/${bookId}`,
      {
        method: "DELETE",
      }
    );

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
      bookType: book.bookType,
      author: book.author,
      genre: book.genre,
      price: book.price,
      mrp: book.mrp,
      stock: book.stock,
      weight: book.weight,
    });
    setEditingBookId(book._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOrderStatusUpdate = async (orderId, status) => {
    const res = await fetch(
      `${import.meta.env.VITE_APP_API_URL}/api/orders/${orderId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );

    if (res.ok) {
      alert("Order status updated successfully!");
      fetchOrders();
    } else {
      alert("Error updating order status.");
    }
  };

  const filteredBooks = books.filter(
    (book) =>
      (book?.title || "").toLowerCase().includes(searchTerm) ||
      (book?.author || "").toLowerCase().includes(searchTerm) ||
      (book?.genre || "").toLowerCase().includes(searchTerm)
  );

  const filteredOrders = orders.filter((order) => {
    const userName = (order?.userId?.name || "").toLowerCase();
    const userEmail = (order?.userId?.email || "").toLowerCase();
    const orderId = (order?._id || "").toLowerCase();
    const bookTitles = (order?.books || [])
      .map((b) => (b?.title || "").toLowerCase())
      .join(" ");

    return (
      userName.includes(searchTerm) ||
      userEmail.includes(searchTerm) ||
      bookTitles.includes(searchTerm) ||
      orderId.includes(searchTerm)
    );
  });

  const filteredPendingOrders = filteredOrders.filter(
    (order) => order.status === "Pending"
  );
  const filteredShippedOrders = filteredOrders.filter(
    (order) => order.status === "Shipped"
  );

  const handleAmountPaidUpdate = async (orderId, amountPaid) => {
    // Find the order object based on orderId (if needed)
    const order = filteredPendingOrders.find((order) => order._id === orderId);
    if (!order) {
      console.error("Order not found!");
      return;
    }

    const amountPending = order.totalPrice - amountPaid;

    const res = await fetch(
      `${
        import.meta.env.VITE_APP_API_URL
      }/api/orders/${orderId}/updateAmountPaid`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountPaid, amountPending }),
      }
    );

    if (res.ok) {
      alert("Amount Paid updated successfully!");
      fetchOrders();
    } else {
      alert("Error updating amount details.");
    }
  };

  const handleAmountPaidChange = (orderId, value) => {
    setAmountPaid((prevState) => ({
      ...prevState,
      [orderId]: value,
    }));
  };

  const startEditingOrder = (order) => {
    setEditingOrderId(order._id);
    setEditedBooks(
      order.books.map((b) => ({
        bookId: b.bookId._id || b.bookId,
        quantity: b.quantity,
      }))
    );
  };

  const handleEditQuantityChange = (bookId, newQty) => {
    setEditedBooks((prev) =>
      prev.map((b) =>
        b.bookId === bookId ? { ...b, quantity: parseInt(newQty) } : b
      )
    );
  };

  const handleRemoveBook = (bookId) => {
    setEditedBooks((prev) => prev.filter((b) => b.bookId !== bookId));
  };

  const handleAddBook = (bookId) => {
    if (!bookId) return;
    setEditedBooks((prev) => [...prev, { bookId, quantity: 1 }]);
  };

  const saveEditedOrder = async (order) => {
    // Create originalBooks array from existing order
    const originalBooks = order.books.map((b) => ({
      bookId: b.bookId._id || b.bookId,
      quantity: b.quantity,
    }));
  
    // Prepare updatedBooks with price and title by matching from allBooks
    const enrichedEditedBooks = editedBooks.map((editedBook) => {
      const bookData = allBooks.find(
        (book) =>
          book._id === editedBook.bookId || book._id === editedBook.bookId?._id
      );
      return {
        bookId: editedBook.bookId,
        quantity: editedBook.quantity,
        title: bookData?.title || "Unknown",
        price: bookData?.price || 0,
      };
    });
  
    // Calculate new total price
    const newTotalPrice = enrichedEditedBooks.reduce((sum, book) => {
      return sum + book.price * book.quantity;
    }, 0);
  
    try {
      const res = await fetch(`/api/orders/${order._id}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalBooks,
          updatedBooks: enrichedEditedBooks,
          totalPrice: newTotalPrice,
        }),
      });
  
      if (!res.ok) {
        // If the response is not OK, handle the error
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
  
      const responseData = await res.json();
      // Handle the response data
      alert("Order updated");
      setEditingOrderId(null);
      fetchOrders();
    } catch (err) {
      alert("Error updating order: " + err.message);
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
        <button onClick={exportToExcel}>
          Export to Excel
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
              type="text"
              placeholder="Book Type"
              value={newBook.bookType}
              onChange={(e) =>
                setNewBook({ ...newBook, bookType: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="MRP"
              value={newBook.mrp}
              onChange={(e) => setNewBook({ ...newBook, mrp: e.target.value })}
            />
            <input
              type="number"
              placeholder="weight"
              value={newBook.weight}
              onChange={(e) =>
                setNewBook({ ...newBook, weight: e.target.value })
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

      <div className="search-bar">
        <div className="search-input-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="search-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0a7 7 0 10-9.9 0 7 7 0 009.9 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by title, author, or genre"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          />
        </div>
      </div>

      {/* Books List */}
      {showBooks && (
        <section className="book-list">
          <h3>Books List</h3>
          <ul>
            {filteredBooks.map((book) => (
              <li key={book._id}>
                <h4>
                  {book.title} by {book.author}
                </h4>
                <p>Genre: {book.genre}</p>
                <p>Price: ₹{book.price}</p>
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
            {filteredPendingOrders.length === 0 ? (
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
                      <strong>Phone:</strong> {order.userId?.phone}
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
                    <div className="amount-paid">
                      <label htmlFor={`amount-paid-${order._id}`}>
                        <strong>Amount Paid:</strong>
                      </label>
                      <input
                        type="number"
                        id={`amount-paid-${order._id}`}
                        value={amountPaid[order._id] || order.amountPaid || ""}
                        onChange={(e) =>
                          handleAmountPaidChange(order._id, e.target.value)
                        }
                      />
                      <button
                        onClick={() =>
                          handleAmountPaidUpdate(
                            order._id,
                            parseFloat(amountPaid[order._id] || 0)
                          )
                        }
                      >
                        Update
                      </button>
                    </div>

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
                    {editingOrderId === order._id ? (
                      <>
                        <div className="edit-order-section">
                          <h4>Edit Books</h4>
                          {editedBooks.map((book, index) => {
                            const bookDetails = allBooks.find(
                              (b) => b._id === book.bookId
                            );
                            return (
                              <div key={index} className="book-edit-row">
                                <span>
                                  {bookDetails?.title || "Unknown Book"}
                                </span>
                                <input
                                  type="number"
                                  value={book.quantity}
                                  min={1}
                                  onChange={(e) =>
                                    handleEditQuantityChange(
                                      book.bookId,
                                      e.target.value
                                    )
                                  }
                                />
                                <button
                                  onClick={() => handleRemoveBook(book.bookId)}
                                >
                                  Remove
                                </button>
                              </div>
                            );
                          })}

                          <select
                            onChange={(e) => handleAddBook(e.target.value)}
                            value=""
                          >
                            <option value="" disabled>
                              Add book...
                            </option>
                            {allBooks
                              .filter(
                                (b) =>
                                  !editedBooks.find((eb) => eb.bookId === b._id)
                              )
                              .map((book) => (
                                <option key={book._id} value={book._id}>
                                  {book.title} (Stock: {book.stock})
                                </option>
                              ))}
                          </select>

                          <div className="edit-buttons">
                            <button onClick={() => saveEditedOrder(order)}>
                              Save Changes
                            </button>
                            <button onClick={() => setEditingOrderId(null)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <button onClick={() => startEditingOrder(order)}>
                        Edit Order
                      </button>
                    )}
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
              filteredShippedOrders.map((order) => (
                <li key={order._id}>
                  <h4>Order #{order._id}</h4>
                  <div className="order-details">
                    <p>
                      <strong>Customer:</strong> {order.userId.name}
                    </p>
                    <p>
                      <strong>Phone:</strong> {order.userId.phone}
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
