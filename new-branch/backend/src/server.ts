import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { Server as SocketIOServer } from "socket.io";
import db from "./config/db";

import authRoutes from "./routes/authRoutes";
import gameRoutes from "./routes/gameRoutes";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Serve frontend
app.use(express.static(path.join(__dirname, "../../frontend/dist")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

/*
// Socket.IO Chat Handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  let currentRoom = "";

  // Join Room
  socket.on("joinRoom", async ({ roomId, username }) => {
    currentRoom = roomId;
    socket.join(roomId);

    // Send system message to room
    socket.to(roomId).emit("chatMessage", {
      username: "System",
      message: `${username} has joined the game.`,
      timestamp: new Date().toISOString()
    });

    // Fetch chat history from DB
    try {
      const [rows] = await db.query(
        "SELECT username, message, timestamp FROM chat_messages WHERE game_id = ? ORDER BY timestamp ASC",
        [roomId]
      );
      socket.emit("chatHistory", rows);
    } catch (err) {
      console.error("DB error fetching history:", err);
    }
  });

  // Chat message
  socket.on("chatMessage", async ({ roomId, username, message }) => {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace('T', ' '); // Time format: 'YYYY-MM-DD HH:MM:SS'
  
    try {
      await db.query(
        "INSERT INTO chat_messages (game_id, username, message, timestamp) VALUES (?, ?, ?, ?)",
        [roomId, username, message, timestamp]
      );
  
      io.to(roomId).emit("chatMessage", { username, message, timestamp });
    } catch (err) {
      console.error("DB error inserting message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (currentRoom) {
      socket.to(currentRoom).emit("chatMessage", {
        username: "System",
        message: "A player has left the game.",
        timestamp: new Date().toISOString()
      });
    }
  });
});
*/

// Socket.IO Chat Handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  let currentRoom = "";

  // Join Room
  socket.on("joinRoom", async ({ roomId, username }) => {
    currentRoom = roomId;
    socket.join(roomId);

    // Send system message to room
    socket.to(roomId).emit("chatMessage", {
      username: "System",
      message: `${username} has joined the game.`,
      timestamp: new Date().toISOString()
    });

    // Fetch chat history from DB
    try {
      const result = await db.query(
        "SELECT username, message, timestamp FROM chat_messages WHERE game_id = $1 ORDER BY timestamp ASC",
        [roomId]
      );
      socket.emit("chatHistory", result.rows);
    } catch (err) {
      console.error("DB error fetching history:", err);
    }
  });

  // Chat message
  socket.on("chatMessage", async ({ roomId, username, message }) => {
    const now = new Date();
    const timestamp = now.toISOString();
  
    try {
      await db.query(
        "INSERT INTO chat_messages (game_id, username, message, timestamp) VALUES ($1, $2, $3, $4)",
        [roomId, username, message, timestamp]
      );
  
      io.to(roomId).emit("chatMessage", { username, message, timestamp });
    } catch (err) {
      console.error("DB error inserting message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (currentRoom) {
      socket.to(currentRoom).emit("chatMessage", {
        username: "System",
        message: "A player has left the game.",
        timestamp: new Date().toISOString()
      });
    }
  });
});
// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
