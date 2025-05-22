import db from "../connection";
import {
  GET_FRIENDS,
  CHECK_FRIENDSHIP,
  CREATE_FRIEND_REQUEST,
  UPDATE_FRIEND_STATUS,
  DELETE_FRIENDSHIP,
  GET_FRIEND_REQUESTS,
  GET_FRIEND_STATUS
} from "./sql";

const getFriends = async (userId: number) => {
  try {
    const friends = await db.any(GET_FRIENDS, [userId]);
    return friends;
  } catch (error) {
    console.error("Error getting friends list:", error);
    throw error;
  }
};

const checkFriendship = async (userId: number, friendId: number) => {
  try {
    const result = await db.oneOrNone(CHECK_FRIENDSHIP, [userId, friendId]);
    return result?.status;
  } catch (error) {
    console.error("Error checking friendship:", error);
    throw error;
  }
};

const createFriendRequest = async (userId: number, friendId: number) => {
  try {
    if (userId === friendId) {
      throw new Error("Cannot add yourself as a friend");
    }
    
    const existingStatus = await checkFriendship(userId, friendId);
    if (existingStatus) {
      throw new Error("Friendship already exists");
    }

    const result = await db.one(CREATE_FRIEND_REQUEST, [userId, friendId]);
    return result.id;
  } catch (error) {
    console.error("Error creating friend request:", error);
    throw error;
  }
};

const updateFriendStatus = async (userId: number, friendId: number, status: 'accepted' | 'rejected') => {
  try {
    const result = await db.oneOrNone(UPDATE_FRIEND_STATUS, [status, userId, friendId]);
    return result?.id;
  } catch (error) {
    console.error("Error updating friend status:", error);
    throw error;
  }
};

const deleteFriendship = async (userId: number, friendId: number) => {
  try {
    const result = await db.oneOrNone(DELETE_FRIENDSHIP, [userId, friendId]);
    return result?.id;
  } catch (error) {
    console.error("Error deleting friendship:", error);
    throw error;
  }
};

const getFriendRequests = async (userId: number) => {
  try {
    const requests = await db.any(GET_FRIEND_REQUESTS, [userId]);
    return requests;
  } catch (error) {
    console.error("Error getting friend requests:", error);
    throw error;
  }
};

const getFriendStatus = async (userId: number, friendId: number) => {
  try {
    const result = await db.oneOrNone(GET_FRIEND_STATUS, [userId, friendId]);
    return result?.status;
  } catch (error) {
    console.error("Error getting friend status:", error);
    throw error;
  }
};

export default {
  getFriends,
  checkFriendship,
  createFriendRequest,
  updateFriendStatus,
  deleteFriendship,
  getFriendRequests,
  getFriendStatus
};