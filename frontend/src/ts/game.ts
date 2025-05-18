import io from "socket.io-client"; // Default import
 // Import WebSocket client

const socket = io("http://localhost:5000"); // Connect to backend WebSocket server

socket.on("connect", () => {
    console.log("Connected to WebSocket server 🎮");
});
