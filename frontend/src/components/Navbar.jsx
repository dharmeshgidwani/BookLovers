import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../css/Navbar.css';

function Navbar() {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the menu automatically when the path changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  if (location.pathname === "/login" || location.pathname === "/signup") return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">Book Lovers</Link>
      </div>

      {/* Hamburger Menu */}
      <div className="hamburger" onClick={toggleMenu}>
        ☰
      </div>

      <div className={`navbar-links-container ${menuOpen ? 'active' : ''}`}>
        <div className="navbar-links">
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
          <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart</Link>
          {auth.user ? (
            <>
              <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
