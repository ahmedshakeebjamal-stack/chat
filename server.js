// server.js
const path = require("path");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());

// Serve React build
const buildPath = path.join(__dirname, "build");
app.use(express.static(buildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Postgres connection pool – your Render DB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Create messages table if it doesn't exist
async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        text_encrypted TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Postgres DB ready");
  } catch (err) {
    console.error("DB init error:", err);
  }
}

initDb();

// Socket.io events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 1) Send chat history from Postgres
  (async () => {
    try {
      const result = await pool.query(
        "SELECT username, text_encrypted FROM messages ORDER BY id ASC LIMIT 50"
      );
      // rows: [{ username, text_encrypted }, ...]
      socket.emit("chat_history", result.rows);
    } catch (err) {
      console.error("Error loading history:", err);
    }
  })();

  // 2) Save incoming message and broadcast
  socket.on("send_message", async (data) => {
    try {
      // data: { user, text } where text is already encrypted
      await pool.query(
        "INSERT INTO messages (username, text_encrypted) VALUES ($1, $2)",
        [data.user, data.text]
      );
      io.emit("receive_message", data);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Port (Render provides PORT env; fallback for local dev)
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
