import bcrypt from "bcrypt";
import crypto from "crypto";
import db from "../connection";
import {
  REGISTER_USER,
  LOGIN_USER,
  GET_USER_PASSWORD,
  UPDATE_USER_PASSWORD,
  UPDATE_USERNAME,
  GET_USER_AVATAR,
  UPDATE_AVATAR,
  UPDATE_STATS_WIN,
  UPDATE_STATS_PLAYED,
  GET_USER_BY_ID,
} from "./sql";

const register = async (email: string, password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const { id, gravatar } = await db.one(REGISTER_USER, [
    email,
    hashedPassword,
    crypto.createHash("sha256").update(email).digest("hex"),
  ]);
  return { id, gravatar, email };
};

const login = async (email: string, password: string) => {
  const {
    id,
    avatar_url,
    games_played,
    games_won,
    password: encryptedPassword,
  } = await db.one(LOGIN_USER, [email]);

  const isValidPassword = await bcrypt.compare(password, encryptedPassword);
  if (!isValidPassword) {
    throw new Error("Invalid credentials, try again.");
  }
  return { id, avatar_url, games_played, games_won, email };
};

const validatePassword = async (userId: number, password: string) => {
  const { password: storedPassword } = await db.one(GET_USER_PASSWORD, [
    userId,
  ]);
  return bcrypt.compare(password, storedPassword);
};

const updatePassword = async (userId: number, newPassword: string) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await db.none(UPDATE_USER_PASSWORD, [hashedPassword, userId]);
};

const updateUsername = async (userId: number, username: string) => {
  await db.none(UPDATE_USERNAME, [username, userId]);
};

const getAvatarUrl = async (userId: number) => {
  const result = await db.oneOrNone(GET_USER_AVATAR, [userId]);
  return result?.avatar_url;
};

const updateAvatar = async (userId: number, avatarUrl: string) => {
  await db.none(UPDATE_AVATAR, [avatarUrl, userId]);
};

const updateStats = async (userId: number, won: boolean = false) => {
  await db.none(won ? UPDATE_STATS_WIN : UPDATE_STATS_PLAYED, [userId]);
};

const getById = async (userId: number) => {
  const user = await db.one(GET_USER_BY_ID, [userId]);
  return user;
};

export default {
  register,
  login,
  validatePassword,
  updatePassword,
  updateUsername,
  getAvatarUrl,
  updateAvatar,
  updateStats,
  getById,
};
