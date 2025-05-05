import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import '../css/ForgotPassword.css';

function ForgotPassword() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [userFound, setUserFound] = useState(false);
  const [enteredName, setEnteredName] = useState(""); 
  const [nameMatch, setNameMatch] = useState(false);
  const [loading, setLoading] = useState(false); 

  const navigate = useNavigate();

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    try {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/auth/check-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setName(data.name);
        setUserFound(true);
        toast.success("User found. Please enter your name to verify.");
      } else {
        toast.error(data.message || "User not found");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false); 
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (enteredName === name) {
      setNameMatch(true);
      toast.success("Name matched. Please enter your new password.");
    } else {
      toast.error("Name does not match. Please try again.");
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Password reset successful. Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(data.message || "Password reset failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="forgot-password-page">
      <ToastContainer />
      <h2>Reset Password</h2>
      {!userFound ? (
        <form className="forgot-form" onSubmit={handlePhoneSubmit}>
          <input
            className="input-field"
            type="number"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <button className="forgot-button" type="submit">
            {loading ? "Finding..." : "Find User"}
          </button>
        </form>
      ) : !nameMatch ? (
        <form className="forgot-form" onSubmit={handleNameSubmit}>
          <p>Hello, we found a user with your phone number </p> 
          <p>Please enter your <strong>NAME</strong> to verify.</p>
          <input
            className="input-field"
            type="text"
            placeholder="Enter your name"
            value={enteredName}
            onChange={(e) => setEnteredName(e.target.value)}
            required
          />
          <button className="forgot-button" type="submit">
            {loading ? "Verifying..." : "Verify Name"}
          </button>
        </form>
      ) : (
        <form className="forgot-form" onSubmit={handleResetSubmit}>
          <p>Hello, <strong>{name}</strong>. Please enter your new password.</p>
          <input
            className="input-field"
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button className="forgot-button" type="submit">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default ForgotPassword;
