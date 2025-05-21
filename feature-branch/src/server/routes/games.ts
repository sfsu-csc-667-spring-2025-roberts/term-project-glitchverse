import express from "express";
import { Request, Response } from "express";

import { Game } from "../db";

const router = express.Router();

router.get("/list", async (request: Request, response: Response) => {
  // @ts-ignore
  const { id: userId } = request.session.user;

  try {
    const myGames = await Game.getGamesByUserId(userId);
    const availableGames = await Game.getGames(userId);

    response.json({
      myGames,
      availableGames,
    });
  } catch (error) {
    console.log({ error });
    response.status(500).json({ error: "Failed to fetch games" });
  }
});

router.post("/create", async (request: Request, response: Response) => {
  // @ts-ignore
  const { id: userId } = request.session.user;
  const { description, minPlayers, maxPlayers, password } = request.body;

  try {
    const gameId = await Game.create(
      description,
      minPlayers,
      maxPlayers,
      password,
      userId,
    );

    response.redirect(`/games/${gameId}`);
  } catch (error) {
    console.log({ error });

    response.redirect("/lobby");
  }
});

router.post("/join/:gameId", async (request: Request, response: Response) => {
  const { gameId } = request.params;
  const { password } = request.body;
  // @ts-ignore
  const { id: userId } = request.session.user;

  try {
    const playerCount = await Game.join(userId, parseInt(gameId), password);
    console.log({ playerCount });

    response.redirect(`/games/${gameId}`);
  } catch (error) {
    console.log({ error });

    response.redirect("/lobby");
  }
});

router.get("/:gameId", async (request: Request, response: Response) => {
  const { gameId: paramsGameId } = request.params;
  const gameId = parseInt(paramsGameId);

  const { id: userId } = request.session.user!;
  const hostId = await Game.getHost(gameId);

  response.render("games", { gameId, isHost: hostId === userId });
});

router.post("/:gameId/start", async (request: Request, response: Response) => {
  const { gameId: paramsGameId } = request.params;
  const gameId = parseInt(paramsGameId);

  const { id: userId } = request.session.user!;
  const hostId = await Game.getHost(gameId);

  if (hostId !== userId) {
    response.status(403).json({ error: "Only host can start the game" });
    return;
  }

  const gameInfo = await Game.getInfo(gameId);
  if (gameInfo.min_players > gameInfo.player_count) {
    response.status(400).json({ error: "Not enough players" });
    return;
  }

  await Game.start(gameId);

  request.app.get("io").emit(`game:start:${gameId}`);

  response.status(200).json({ success: true });
});

router.get("/:gameId/play", async (request: Request, response: Response) => {
  const { gameId: paramsGameId } = request.params;
  const gameId = parseInt(paramsGameId);

  const { id: userId } = request.session.user!;
  const hostId = await Game.getHost(gameId);

  response.render("in-games", { gameId, isHost: hostId === userId });
});

router.post("/:gameId/leave", async (request: Request, response: Response) => {
  const { gameId: paramsGameId } = request.params;
  const gameId = parseInt(paramsGameId);
  const { id: userId } = request.session.user!;

  try {
    await Game.removePlayer(gameId, userId);

    const remainingPlayers = (await Game.getInfo(gameId)).player_count;
    console.log(
      `Player ${userId} left game ${gameId}. Remaining players: ${remainingPlayers}`,
    );

    response.status(200).json({
      success: true,
      remainingPlayers: remainingPlayers,
    });
  } catch (error) {
    console.error("Error leaving game:", error);
    response.status(500).json({ error: "Failed to leave game" });
  }
});

router.post("/:gameId/delete", async (request: Request, response: Response) => {
  const { gameId: paramsGameId } = request.params;
  const gameId = parseInt(paramsGameId);

  try {
    const gameInfo = await Game.getInfo(gameId);
    if (gameInfo.player_count === 0) {
      await Game.delete(gameId);
      response.status(200).json({ success: true });
    } else {
      response.status(400).json({ error: "Game still has players" });
    }
  } catch (error) {
    console.error("Error deleting game:", error);
    response.status(500).json({ error: "Failed to delete game" });
  }
});

const drawnNumbersPerGame: Record<number, Set<number>> = {};

router.post("/:gameId/number", async (request: Request, response: Response) => {
  try {
    const { gameId: paramGameId } = request.params;
    const gameId = parseInt(paramGameId);
    const { id: userId } = request.session.user!;

    const players = await Game.getPlayers(gameId);
    if (!drawnNumbersPerGame[gameId]) {
      drawnNumbersPerGame[gameId] = new Set();
    }

    const drawnSet = drawnNumbersPerGame[gameId];
    const remainingNumbers = [...Array(75).keys()]
      .map((n) => n + 1)
      .filter((n) => !drawnSet.has(n));

    if (remainingNumbers.length === 0) {
      response.status(400).json({ error: "All numbers have been drawn" });
      return;
    }

    const number =
      remainingNumbers[Math.floor(Math.random() * remainingNumbers.length)];
    drawnSet.add(number);

    const currentPlayerIndex = players.findIndex((p) => p.is_current);
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;

    await Game.setCurrentPlayer(gameId, players[nextPlayerIndex].id);

    const io = request.app.get("io");
    io.emit(`game:number:${gameId}`, number);
    io.emit(`game:turn:${gameId}`, players[nextPlayerIndex].id);

    response.json({ number });
  } catch (error) {
    console.error("Error generating number:", error);
    response.status(500).json({ error: "Failed to generate number" });
  }
});

export default router;
