// src/chat.js
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import CryptoJS from "crypto-js";
import "./Chat.css";

// Use localhost in dev, same origin in production
const socket = io(
  process.env.NODE_ENV === "production" ? undefined : "http://localhost:4000"
);

const SECRET_KEY = "my_super_secret_key_123";

function encrypt(text) {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

function decrypt(ciphertext) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8) || "[decrypt error]";
  } catch (e) {
    return "[decrypt error]";
  }
}

function Chat({ username }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  // Load history from server (Postgres)
  useEffect(() => {
    const historyHandler = (rows) => {
      // rows: [{ username, text_encrypted }]
      const restored = rows.map((row) => ({
        user: row.username,
        cipher: row.text_encrypted,
        text: decrypt(row.text_encrypted),
      }));
      setChat(restored);
    };
    

    const messageHandler = (data) => {
      const decryptedText = decrypt(data.text);
      const msg = {
        user: data.user,
        cipher: data.text,
        text: decryptedText,
      };
      setChat((prev) => [...prev, msg]);
    };

    socket.on("chat_history", historyHandler);
    socket.on("receive_message", messageHandler);

    return () => {
      socket.off("chat_history", historyHandler);
      socket.off("receive_message", messageHandler);
    };
  }, []);

  const sendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    const encryptedText = encrypt(trimmed);

    // Send to server; server saves in Postgres and broadcasts
    socket.emit("send_message", { user: username, text: encryptedText });

    setMessage("");
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">Ahoy, {username}! ⚓️</h2>

      <div className="chat-box">
        {chat.map((msg, i) => (
          <div
            key={i}
            className={`chat-message ${
              msg.user === username ? "me" : "other"
            }`}
          >
            <strong>{msg.user}:</strong> {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Speak like a pirate..."
          className="chat-input"
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
        />
        <button onClick={sendMessage} className="chat-button">
          Send 🏴‍☠️
        </button>
      </div>
    </div>
  );
}

export default Chat;
