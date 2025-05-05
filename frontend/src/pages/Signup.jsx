import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "../css/Signup.css";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(null);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading("Creating your account...");

    try {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (res.status === 201) {
        toast.update(loadingToast, {
          render: "Signup successful!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        setTimeout(() => navigate("/login"), 1500); 
      } else {
        toast.update(loadingToast, {
          render: data.message || "Signup failed",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (err) {
      console.error(err);
      toast.update(loadingToast, {
        render: "Something went wrong. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="signup-page">
      <ToastContainer position="top-center" />
      
      <div className="branding-top">
        <h1 className="brand-title">📚 Book Lovers</h1>
        <p className="brand-subtitle">Your journey into the world of books starts here!</p>
      </div>

      <div className="signup-form">
        <h2>Create Account</h2>
        <form className="signup-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
          />
          <input
            type="email"
            placeholder="Email (Optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
          />
          <input
            type="number"
            placeholder="Whatsapp Number"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-field"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
          {/* <input
            type="text"
            placeholder="Address"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="input-field"
          /> */}
          <button type="submit" className="signup-button">Signup</button>
        </form>
        <p className="link-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
