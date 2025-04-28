import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../css/Login.css";

function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, password }),
        }
      );

      const data = await res.json();
      setIsLoading(false);

      if (res.ok) {
        login(data.user, data.token);

        // Redirect based on role
        if (data.user.role === "admin") {
          navigate("/adminDashboard");
        } else {
          navigate("/");
        }
      } else {
        alert(data.message || "❌ Login failed");
      }
    } catch (err) {
      setIsLoading(false);
      console.error("Error during login:", err);
      alert("❌ Something went wrong. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="branding-main">
        <h1 className="brand-title">📚 Book Lovers</h1>
        <p className="brand-subtitle">Your favorite stories await.</p>
      </div>

      <div className="login-form">
        <div className="branding1">
          <h2>Login</h2>
          <p>Welcome back, start your next adventure!</p>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            placeholder="Phone Number"
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
          <button type="submit" disabled={isLoading} className="login-button">
            {isLoading ? "Logging in..." : "Login"}
          </button>

          <p className="link-text">
            Don't have an account? <Link to="/signup">Signup</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
