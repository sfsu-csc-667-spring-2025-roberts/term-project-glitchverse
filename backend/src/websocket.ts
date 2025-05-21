import { Server } from "socket.io";
import { generateBingoCard, checkBingoWin } from "./models/bingoModel";

const activeGames: Record<number, { players: string[]; drawnNumbers: Set<number> }> = {};

export default (server: any) => {
  const io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("New player connected:", socket.id);

    socket.on("joinGame", (gameId: number, username: string) => {
      socket.join(gameId.toString());

      if (!activeGames[gameId]) {
        activeGames[gameId] = { players: [], drawnNumbers: new Set() };
      }

      activeGames[gameId].players.push(username);

      io.to(gameId.toString()).emit("playerJoined", { username, gameId });
    });

    socket.on("requestBingoCard", (gameId) => {
      const bingoCard = generateBingoCard();
      socket.emit("receiveBingoCard", { card: bingoCard });
    });

    socket.on("drawNumber", (gameId) => {
      if (!activeGames[gameId]) return;

      let newNumber;
      do {
        newNumber = Math.floor(Math.random() * 75) + 1;
      } while (activeGames[gameId].drawnNumbers.has(newNumber));

      activeGames[gameId].drawnNumbers.add(newNumber);

      io.to(gameId.toString()).emit("newNumberDrawn", { number: newNumber });
    });

    socket.on("checkWin", ({ gameId, card }) => {
      const game = activeGames[gameId];
      if (!game) return;

      if (checkBingoWin(card, game.drawnNumbers)) {
        io.to(gameId.toString()).emit("gameWon", { winner: socket.id });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};
