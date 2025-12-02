// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors()); // allow all origins for now

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // later you can restrict to your InfinityFree URL
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("send_message", (data) => {
    // data.text is encrypted; just broadcast as-is
    io.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// IMPORTANT: use process.env.PORT for Render
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});