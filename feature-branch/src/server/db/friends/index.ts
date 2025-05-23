import db from "../connection";
import {
  GET_FRIENDS,
  CHECK_FRIENDSHIP,
  CREATE_FRIEND_REQUEST,
  UPDATE_FRIEND_STATUS,
  DELETE_FRIENDSHIP,
  GET_FRIEND_REQUESTS,
  GET_FRIEND_STATUS,
  GET_CHAT_HISTORY,
  SAVE_MESSAGE,
} from "./sql";

/**
 * Retrieves a user's friends list from database
 * @param userId - ID of the target user
 * @returns Promise resolving to array of friend objects
 */
const getFriends = async (userId: number) => {
  try {
    const friends = await db.any(GET_FRIENDS, [userId]);
    return friends;
  } catch (error) {
    console.error("Error getting friends list:", error);
    throw error;
  }
};

/**
 * Checks friendship status between two users
 * @param userId - ID of the primary user
 * @param friendId - ID of the friend to check
 * @returns Promise resolving to friendship status string or undefined
 */
const checkFriendship = async (userId: number, friendId: number) => {
  try {
    const result = await db.oneOrNone(CHECK_FRIENDSHIP, [userId, friendId]);
    return result?.status;
  } catch (error) {
    console.error("Error checking friendship:", error);
    throw error;
  }
};

/**
 * Creates a new friend request
 * @param userId - ID of the requesting user
 * @param friendId - ID of the target friend
 * @throws Error if trying to add self or duplicate request exists
 * @returns Promise resolving to request ID
 */
const createFriendRequest = async (userId: number, friendId: number) => {
  try {
    // Validate not adding self
    if (userId === friendId) {
      throw new Error("Cannot add yourself as a friend");
    }

    // Check existing status
    const existingStatus = await checkFriendship(userId, friendId);
    if (existingStatus) {
      throw new Error("Friendship already exists");
    }

    // Create new request
    const result = await db.one(CREATE_FRIEND_REQUEST, [userId, friendId]);
    return result.id;
  } catch (error) {
    console.error("Error creating friend request:", error);
    throw error;
  }
};

/**
 * Updates the status of a friend request
 * @param userId - ID of the user performing the update
 * @param friendId - ID of the target friend
 * @param status - New status for the friendship ('accepted' or 'rejected')
 * @returns Promise resolving to the ID of the updated friendship or undefined
 */
const updateFriendStatus = async (userId: number, friendId: number, status: 'accepted' | 'rejected') => {
  try {
    const result = await db.oneOrNone(UPDATE_FRIEND_STATUS, [status, userId, friendId]);
    return result?.id;
  } catch (error) {
    console.error("Error updating friend status:", error);
    throw error;
  }
};

/**
 * Deletes a friendship
 * @param userId - ID of the user performing the deletion
 * @param friendId - ID of the target friend
 * @returns Promise resolving to the ID of the deleted friendship or undefined
 */
const deleteFriendship = async (userId: number, friendId: number) => {
  try {
    const result = await db.oneOrNone(DELETE_FRIENDSHIP, [userId, friendId]);
    return result?.id;
  } catch (error) {
    console.error("Error deleting friendship:", error);
    throw error;
  }
};

/**
 * Retrieves a list of friend requests for a given user
 * @param userId - ID of the user
 * @returns Promise resolving to array of friend requests
 */
const getFriendRequests = async (userId: number) => {
  try {
    const requests = await db.any(GET_FRIEND_REQUESTS, [userId]);
    return requests;
  } catch (error) {
    console.error("Error getting friend requests:", error);
    throw error;
  }
};

/**
 * Retrieves the status of a friendship
 * @param userId - ID of the primary user
 * @param friendId - ID of the secondary user
 * @returns Promise resolving to the status string of the friendship or undefined
 */
const getFriendStatus = async (userId: number, friendId: number) => {
  try {
    const result = await db.oneOrNone(GET_FRIEND_STATUS, [userId, friendId]);
    return result?.status;
  } catch (error) {
    console.error("Error getting friend status:", error);
    throw error;
  }
};

/**
 * Retrieves chat history between two users
 * @param userId - ID of the primary user
 * @param friendId - ID of the chat partner
 * @returns Promise resolving to message history array
 */
const getChatHistory = async (userId: number, friendId: number) => {
  try {
    const messages = await db.any(GET_CHAT_HISTORY, [userId, friendId]);
    return messages;
  } catch (error) {
    console.error("Error getting chat history:", error);
    throw error;
  }
};

/**
 * Saves a private message to database
 * @param senderId - ID of the message sender
 * @param receiverId - ID of the message recipient 
 * @param content - Message text content
 * @returns Promise resolving to message ID
 */
const saveMessage = async (senderId: number, receiverId: number, content: string) => {
  try {
    const result = await db.one(SAVE_MESSAGE, [senderId, receiverId, content]);
    return result.id;
  } catch (error) {
    console.error("Error saving message:", error);
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
  getFriendStatus,
  getChatHistory,
  saveMessage
};