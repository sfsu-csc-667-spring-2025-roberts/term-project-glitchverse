import { DbGameUser, GameInfo, PlayerInfo, User } from "global";
import db from "../connection";
import {
  ADD_PLAYER,
  CONDITIONALLY_JOIN_SQL,
  CREATE_SQL,
  DEAL_CARDS_SQL,
  GET_CARD_SQL,
  GET_GAME_INFO_SQL,
  GET_PLAYERS_SQL,
  GET_USER_GAMES_SQL,
  GET_AVAILABLE_GAMES_SQL,
  IS_HOST_SQL,
  SET_IS_CURRENT_SQL,
  SETUP_DECK_SQL,
  REMOVE_PLAYER_SQL,
  DELETE_GAME_SQL,
} from "./sql";

const create = async (
  name: string,
  minPlayers: string,
  maxPlayers: string,
  password: string,
  userId: number
) => {
  const { id: gameId } = await db.one<{ id: number }>(CREATE_SQL, [
    name,
    minPlayers,
    maxPlayers,
    password,
  ]);

  await db.none(ADD_PLAYER, [gameId, userId]);

  return gameId;
};

const join = async (userId: number, gameId: number, password: string = "") => {
  const { playerCount } = await db.one<{ playerCount: number }>(
    CONDITIONALLY_JOIN_SQL,
    {
      gameId,
      userId,
      password,
    }
  );

  return playerCount;
};

const getHost = async (gameId: number) => {
  const { user_id } = await db.one<{ user_id: number }>(IS_HOST_SQL, [gameId]);

  return user_id;
};

type GetGameInfoResponse = Pick<
  GameInfo,
  "name" | "password" | "min_players" | "max_players"
> & {
  player_count: number;
};

const getInfo = async (gameId: number): Promise<GetGameInfoResponse> => {
  return await db.one<GetGameInfoResponse>(GET_GAME_INFO_SQL, [gameId]);
};

const dealCards = async (
  userId: number,
  gameId: number,
  cardCount: number,
  pile: number
) => {
  await db.none(DEAL_CARDS_SQL, { userId, gameId, cardCount, pile });
};

const getPlayers = async (gameId: number): Promise<(User & DbGameUser)[]> => {
  return await db.many(GET_PLAYERS_SQL, gameId);
};

const setCurrentPlayer = async (gameId: number, userId: number) => {
  await db.none(SET_IS_CURRENT_SQL, { gameId, userId });
};

const removePlayer = async (gameId: number, userId: number) => {
  try {
    const { remainingPlayers } = await db.one(REMOVE_PLAYER_SQL, [
      gameId,
      userId,
    ]);
    return remainingPlayers;
  } catch (error) {
    console.error("Error removing player from game:", error);
    return 0;
  }
};

const deleteGame = async (gameId: number): Promise<boolean> => {
  try {
    await db.one(DELETE_GAME_SQL, [gameId]);
    return true;
  } catch (error) {
    console.error("Error deleting game:", error);
    return false;
  }
};

export const STOCK_PILE = 0;
export const PLAYER_HAND = 1;
export const DISCARD_1 = 2;
export const DISCARD_2 = 3;
export const DISCARD_3 = 4;
export const DISCARD_4 = 5;

export const DRAW_PILE = 0;
export const NORTH_PILE = 1;
export const EAST_PILE = 2;
export const SOUTH_PILE = 3;
export const WEST_PILE = 4;

const start = async (gameId: number) => {
  await db.none(SETUP_DECK_SQL, { gameId });

  const players = await getPlayers(gameId);

  for (let i = 0; i < players.length; i++) {
    await dealCards(players[i].id, gameId, 20, STOCK_PILE);
    await dealCards(players[i].id, gameId, 5, PLAYER_HAND);
  }

  await setCurrentPlayer(gameId, players[0].id);
};

const getState = async (gameId: number) => {
  const { name } = await getInfo(gameId);

  const players = (await getPlayers(gameId)).map(
    ({ id, email, avatar_url, seat, is_current: isCurrent }) => ({
      id,
      email,
      avatar_url,
      seat,
      isCurrent,
    })
  );

  const playerInfo: Record<number, PlayerInfo> = {};

  for (let i = 0; i < players.length; i++) {
    const { id } = players[i];

    try {
      playerInfo[id] = {
        gravatar: players[i].avatar_url ?? "",
        ...players[id],
        hand: await db.manyOrNone(GET_CARD_SQL, {
          gameId,
          userId: id,
          limit: 6,
          pile: PLAYER_HAND,
        }),
        stockPileTop: await db.one(GET_CARD_SQL, {
          gameId,
          userId: id,
          limit: 1,
          pile: STOCK_PILE,
        }),
        discardPiles: await Promise.all(
          [DISCARD_1, DISCARD_2, DISCARD_3, DISCARD_4].map((pile) =>
            db.any(GET_CARD_SQL, { gameId, userId: id, limit: 162, pile })
          )
        ),
      };
    } catch (error) {
      console.error({ error });
    }
  }

  return {
    name,
    buildPiles: await Promise.all(
      [NORTH_PILE, EAST_PILE, SOUTH_PILE, WEST_PILE].map((pile) => {
        return db.oneOrNone(GET_CARD_SQL, {
          gameId,
          pile,
          userId: 0,
          limit: 1,
        });
      })
    ),
    players: playerInfo,
  };
};

const getGamesByUserId = async (userId: number) => {
  try {
    const games = await db.manyOrNone(GET_USER_GAMES_SQL, [userId]);
    console.log("Raw database response:", games);

    return games.map((game) => ({
      ...game,
      player_count: isNaN(Number(game.player_count))
        ? 0
        : Number(game.player_count),
      status:
        (Number(game.player_count) || 0) >= game.max_players
          ? "playing"
          : "waiting",
    }));
  } catch (error) {
    console.error("Error getting user games:", error);
    return [];
  }
};

const getGames = async (userId: number) => {
  try {
    const games = await db.manyOrNone(GET_AVAILABLE_GAMES_SQL, [userId]);
    return games.map((game) => ({
      ...game,
      player_count: isNaN(Number(game.player_count))
        ? 0
        : Number(game.player_count),
      status: "waiting",
    }));
  } catch (error) {
    console.error("Error getting available games:", error);
    return [];
  }
};

export default {
  create,
  dealCards,
  getHost,
  getInfo,
  getPlayers,
  getState,
  getGamesByUserId,
  getGames,
  join,
  setCurrentPlayer,
  start,
  removePlayer,
  delete: deleteGame,
  cardLocations: {
    STOCK_PILE: STOCK_PILE,
    PLAYER_HAND: PLAYER_HAND,
    DISCARD_1: DISCARD_1,
    DISCARD_2: DISCARD_2,
    DISCARD_3: DISCARD_3,
    DISCARD_4: DISCARD_4,
    DRAW_PILE: DRAW_PILE,
    NORTH_PILE: NORTH_PILE,
    EAST_PILE: EAST_PILE,
    SOUTH_PILE: SOUTH_PILE,
    WEST_PILE: WEST_PILE,
  },
};
