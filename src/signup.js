import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import "./Login.css";

const SECRET_KEY = "my_super_secret_key_123"; // demo only

function encrypt(text) {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

function decrypt(cipher) {
  const bytes = CryptoJS.AES.decrypt(cipher, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

function Signup() {
  const [username, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = () => {
    if (!username.trim() || !password.trim()) {
      setError("Both fields are required!");
      return;
    }

    // 1) Read existing users (decrypt each password)
    const raw = localStorage.getItem("users");
    let users = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      users = parsed.map((u) => ({
        username: u.username,
        password: decrypt(u.password), // decrypt stored passwords
      }));
    }

    // 2) Check duplicate username
    if (users.find((u) => u.username === username)) {
      setError("Username already taken!");
      return;
    }

    // 3) Add new user, but encrypt password before saving
    users.push({ username, password });

    const storedUsers = users.map((u) => ({
      username: u.username,
      password: encrypt(u.password), // encrypted in localStorage
    }));

    localStorage.setItem("users", JSON.stringify(storedUsers));

    navigate("/");
  };

  return (
    <div className="login-container">
      <h2 className="login-title">⚓ Create Your Pirate Account ⚓</h2>
      <input
        type="text"
        placeholder="Choose a pirate name"
        value={username}
        onChange={(e) => setUser(e.target.value)}
        className="login-input"
      />
      <input
        type="password"
        placeholder="Choose a password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="login-input"
      />
      {error && <p className="error-message">{error}</p>}
      <button onClick={handleSignup} className="login-button">
        Sign Up 🏴‍☠️
      </button>
    </div>
  );
}

export default Signup;