"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
const db_1 = __importDefault(require("./config/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const gameRoutes_1 = __importDefault(require("./routes/gameRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)("dev"));
// Serve frontend
app.use(express_1.default.static(path_1.default.join(__dirname, "../../frontend/dist")));
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../../frontend/dist/index.html"));
});
// API Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/games", gameRoutes_1.default);
// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: "Not Found" });
});
// Socket.IO Chat Handling
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
    let currentRoom = "";
    // Join Room
    socket.on("joinRoom", (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomId, username }) {
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
            const [rows] = yield db_1.default.query("SELECT username, message, timestamp FROM chat_messages WHERE game_id = ? ORDER BY timestamp ASC", [roomId]);
            socket.emit("chatHistory", rows);
        }
        catch (err) {
            console.error("DB error fetching history:", err);
        }
    }));
    // Chat message
    socket.on("chatMessage", (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomId, username, message }) {
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace('T', ' '); // Time format: 'YYYY-MM-DD HH:MM:SS'
        try {
            yield db_1.default.query("INSERT INTO chat_messages (game_id, username, message, timestamp) VALUES (?, ?, ?, ?)", [roomId, username, message, timestamp]);
            io.to(roomId).emit("chatMessage", { username, message, timestamp });
        }
        catch (err) {
            console.error("DB error inserting message:", err);
        }
    }));
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
