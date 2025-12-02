// login.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import CryptoJS from "crypto-js";
import "./Login.css";

const SECRET_KEY = "my_super_secret_key_123";

function decrypt(cipher) {
  const bytes = CryptoJS.AES.decrypt(cipher, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

function Login({ setUsername }) {
  const [username, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    const stored = JSON.parse(localStorage.getItem("users")) || [];

    // decrypt each stored password before comparing
    const users = stored.map((u) => ({
      username: u.username,
      password: decrypt(u.password),
    }));

    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      setUsername(username);
      navigate("/chat");
    } else {
      setError("Invalid username or password!");
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">☠️ One Piece Chatroom ☠️</h2>

      <input
        type="text"
        placeholder="Enter your pirate name"
        value={username}
        onChange={(e) => setUser(e.target.value)}
        className="login-input"
      />

      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="login-input"
      />

      {error && <p className="error-message">{error}</p>}

      <button onClick={handleLogin} className="login-button">
        Set Sail 🚢
      </button>

      <p className="signup-link">
        Don’t have an account? <Link to="/signup">Sign up here</Link>
      </p>
    </div>
  );
}

export default Login;
