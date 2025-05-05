import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

    const loadingToast = toast.loading("Logging in...");

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
        toast.update(loadingToast, {
          render: "Login successful!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        login(data.user, data.token);

        // Redirect based on role
        if (data.user.role === "admin") {
          navigate("/adminDashboard");
        } else {
          navigate("/");
        }
      } else {
        toast.update(loadingToast, {
          render: data.message || "Login failed",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (err) {
      setIsLoading(false);
      console.error("Error during login:", err);
      toast.update(loadingToast, {
        render: "Something went wrong. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="login-page">
      <ToastContainer position="top-right" />

      <div className="branding-main">
        <h1 className="brand-title">📚 Book Lovers</h1>
        <p className="brand-subtitle">Your favorite stories await.</p>
      </div>

      <div className="login-form">
        <div className="branding1">
          <h2>Login</h2>
          <p>Welcome back, start your next adventure!</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
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
            <Link to="/forgot-password">Forgot Password?</Link>
          </p>

          <p className="link-text">
            Don't have an account? <Link to="/signup">Signup</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
