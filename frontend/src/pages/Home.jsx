import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/Home.css";

function Home() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [originalBooks, setOriginalBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/books`);
        const data = await res.json();
        setBooks(data);
        setOriginalBooks(data);
      } catch (err) {
        console.error("Error fetching books:", err);
      }
    };
    fetchBooks();
  }, []);

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setBooks(originalBooks);
    } else {
      const filteredBooks = originalBooks.filter((book) =>
        (book.title?.toLowerCase() || "").includes(query.toLowerCase()) ||
        (book.author?.toLowerCase() || "").includes(query.toLowerCase()) ||
        (book.genre?.toLowerCase() || "").includes(query.toLowerCase())
      );
      setBooks(filteredBooks);
    }
  };

  const genres = [...new Set(books.map((book) => book.genre))];

  return (
    <div className="home-page">
      <div className="branding">
        <h1>Book Lovers</h1>
        <p>Babies Love for Books....</p>
        <div className="tagline">
          <p>"Explore, Discover, and Fall in Love with Books."</p>
        </div>
      </div>

      {/* Search bar with icon */}
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0a7 7 0 10-9.9 0 7 7 0 009.9 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by title, author, or genre"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {genres.length === 0 ? (
        <p>No books found matching your search!</p>
      ) : (
        genres.map((genre) => (
          <section key={genre} className="genre-section">
            <h2>{genre}</h2>
            <div className="books-list">
              {books
                .filter((book) => book.genre === genre)
                .map((book) => (
                  <div key={book._id} className="book-item">
                    <img
                      src={book.imageUrl}
                      alt={book.title}
                      className="book-image"
                    />
                    <h3>{book.title}</h3>
                    <p>Author: {book.author}</p>
                    <p>MRP: ₹{book.mrp}</p>
                    <p>Price: ₹{book.price}</p>
                    <p>Book Type: {book.bookType}</p>
                    <Link to={`/book/${book._id}`} className="btn">
                      View Details
                    </Link>
                  </div>
                ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

export default Home;
