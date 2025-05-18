import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import authRoutes from "./routes/authRoutes";
import gameRoutes from "./routes/gameRoutes";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Serve frontend (HTML, CSS, JS, assets)
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

// Home Route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/games", gameRoutes);

// Catch-all for unknown API routes
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
