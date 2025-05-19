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
    response.status(200).send();
    return;
  }

  const gameInfo = await Game.getInfo(gameId);
  if (gameInfo.min_players < gameInfo.player_count) {
    // TODO: Broadcast game update stating "not enough players"

    response.status(200).send();
    return;
  }

  await Game.start(gameId);

  const gameState = await Game.getState(gameId);
  console.log({ gameState: JSON.stringify(gameState, null, 2) });

  response.status(200).send();
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

export default router;
