"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const bingoModel_1 = require("./models/bingoModel");
const activeGames = {};
exports.default = (server) => {
    const io = new socket_io_1.Server(server, { cors: { origin: "*" } });
    io.on("connection", (socket) => {
        console.log("New player connected:", socket.id);
        socket.on("joinGame", (gameId, username) => {
            socket.join(gameId.toString());
            if (!activeGames[gameId]) {
                activeGames[gameId] = { players: [], drawnNumbers: new Set() };
            }
            activeGames[gameId].players.push(username);
            io.to(gameId.toString()).emit("playerJoined", { username, gameId });
        });
        socket.on("requestBingoCard", (gameId) => {
            const bingoCard = (0, bingoModel_1.generateBingoCard)();
            socket.emit("receiveBingoCard", { card: bingoCard });
        });
        socket.on("drawNumber", (gameId) => {
            if (!activeGames[gameId])
                return;
            let newNumber;
            do {
                newNumber = Math.floor(Math.random() * 75) + 1;
            } while (activeGames[gameId].drawnNumbers.has(newNumber));
            activeGames[gameId].drawnNumbers.add(newNumber);
            io.to(gameId.toString()).emit("newNumberDrawn", { number: newNumber });
        });
        socket.on("checkWin", ({ gameId, card }) => {
            const game = activeGames[gameId];
            if (!game)
                return;
            if ((0, bingoModel_1.checkBingoWin)(card, game.drawnNumbers)) {
                io.to(gameId.toString()).emit("gameWon", { winner: socket.id });
            }
        });
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
    return io;
};
