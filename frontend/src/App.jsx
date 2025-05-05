// import React, { useContext } from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
//   useLocation
// } from "react-router-dom";
// import Home from "./pages/Home";
// import Contact from "./pages/Contact";
// import Login from "./pages/Login";
// import Signup from "./pages/Signup";
// import AdminDashboard from "./pages/AdminDashboard";
// import AdminRoute from "./components/AdminRoute";
// import Navbar from "./components/Navbar";
// import Book from "./pages/Book";
// import Cart from "./pages/Cart";
// import Profile from "./pages/Profile";
// import { AuthProvider, AuthContext } from "./context/AuthContext";
// import { CartProvider } from "./context/CartContext";
// import ForgotPassword from "./pages/ForgotPassword";

// const AppRoutes = () => {
//   const { auth, loading } = useContext(AuthContext); // Include loading
//   const isLoggedIn = auth.user && auth.token;

//   const location = useLocation();
//   const hideNavbarPaths = ["/login", "/signup", "/forgot-password"];
//   const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

//   if (loading) return <div>Loading...</div>; 
  
//   return (
//     <>
//       {shouldShowNavbar && <Navbar key={isLoggedIn ? "logged-in" : "logged-out"} />}
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/contact" element={<Contact />} />
//         <Route
//           path="/login"
//           element={isLoggedIn ? <Navigate to="/" /> : <Login />}
//         />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route
//           path="/signup"
//           element={isLoggedIn ? <Navigate to="/" /> : <Signup />}
//         />
//         <Route path="/book/:id" element={<Book />} />
//         <Route path="/cart" element={<Cart />} />
//         <Route
//           path="/profile"
//           element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
//         />
//         <Route
//           path="/adminDashboard"
//           element={<AdminRoute element={<AdminDashboard />} />}
//         />
//       </Routes>
//     </>
//   );
// };


// const App = () => {
//   return (
//     <AuthProvider>
//       <CartProvider>
//         <Router>
//           <AppRoutes />
//         </Router>
//       </CartProvider>
//     </AuthProvider>
//   );
// };

// export default App;

import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/Navbar";
import Book from "./pages/Book";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ForgotPassword from "./pages/ForgotPassword";

// Put this inside Router context to access `useLocation`
const AppRoutesWithNavbar = () => {
  const { auth, loading } = useContext(AuthContext);
  const isLoggedIn = auth.user && auth.token;

  const location = useLocation();
  const hideNavbarPaths = ["/login", "/signup", "/forgot-password"];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  if (loading) return <div>Loading...</div>;

  return (
    <>
      {shouldShowNavbar && <Navbar key={isLoggedIn ? "logged-in" : "logged-out"} />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate to="/" /> : <Login />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/signup"
          element={isLoggedIn ? <Navigate to="/" /> : <Signup />}
        />
        <Route path="/book/:id" element={<Book />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/profile"
          element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path="/adminDashboard"
          element={<AdminRoute element={<AdminDashboard />} />}
        />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppRoutesWithNavbar />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
