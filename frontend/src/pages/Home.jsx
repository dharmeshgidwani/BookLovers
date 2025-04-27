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
        const res = await fetch(`http://localhost:5001/api/books`);
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

    if (query === "") {
      setBooks(originalBooks);
    } else {
      const filteredBooks = originalBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(query.toLowerCase()) ||
          book.author.toLowerCase().includes(query.toLowerCase()) ||
          book.genre.toLowerCase().includes(query.toLowerCase())
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

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by title, author, or genre"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {genres.map((genre) => (
        <section key={genre} className="genre-section">
          <h2>{genre}</h2>
          <div className="books-list">
            {books
              .filter((book) => book.genre === genre)
              .map((book) => (
                <div key={book._id} className="book-item">
                  <img
                    src={`http://localhost:5001/${book.imageUrl}`}
                    alt={book.title}
                    className="book-image"
                  />

                  <h3>{book.title}</h3>
                  <p>Author: {book.author}</p>
                  <p>MRP: {book.mrp}</p>
                  <p>Price: ₹ {book.price}</p>
                  <Link to={`/book/${book._id}`} className="btn">
                    View Details
                  </Link>
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default Home;
