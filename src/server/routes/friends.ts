import express from "express";
import { Request, Response } from "express";
import { Friends } from "../db";

const router = express.Router();

// Get friends list
router.get("/list", async (request: Request, response: Response) => {
  try {
    const { id: userId } = request.session.user!;
    if (!userId) {
      throw new Error("Unauthorized access");
    }

    const friends = await Friends.getFriends(userId);
    response.json({ success: true, data: friends });
  } catch (error) {
    console.error("Error getting friends list:", error);
    response
      .status(500)
      .json({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to get friends list",
      });
  }
});

// Send friend request
router.post("/request", async (request: Request, response: Response) => {
  try {
    const { friendId } = request.body;
    const {
      id: userId,
      username,
      avatar_url,
      gravatar,
    } = request.session.user!;

    if (!userId) {
      throw new Error("Unauthorized access");
    }

    if (!friendId) {
      throw new Error("Friend ID cannot be empty");
    }

    const requestId = await Friends.createFriendRequest(
      userId,
      parseInt(friendId)
    );

    const io = request.app.get("io");
    if (io) {
      io.to(friendId.toString()).emit("friend:request", {
        requestId,
        from: {
          id: userId,
          username: username || "Unknown User",
          avatar_url: avatar_url,
          gravatar: gravatar,
        },
      });
    }

    response.json({ success: true, message: "Friend request sent", requestId });
  } catch (error) {
    console.error("Error sending friend request:", error);
    const status =
      error instanceof Error &&
      (error.message === "Cannot add yourself as a friend" ||
        error.message === "Friendship already exists")
        ? 400
        : 500;
    response.status(status).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to send friend request",
    });
  }
});

// Handle friend request
router.post("/respond", async (request: Request, response: Response) => {
  try {
    const { friendId, accept } = request.body;
    const { id: userId } = request.session.user!;

    if (!userId) {
      response
        .status(401)
        .json({ success: false, error: "Unauthorized access" });
    }

    if (!friendId) {
      response
        .status(400)
        .json({ success: false, error: "Friend ID cannot be empty" });
    }

    const status = accept ? "accepted" : "rejected";
    const result = await Friends.updateFriendStatus(
      parseInt(friendId),
      userId,
      status
    );

    if (!result) {
      response
        .status(404)
        .json({
          success: false,
          error: "Friend request not found or already processed",
        });
    }

    const io = request.app.get("io");
    if (io) {
      io.to(friendId.toString()).emit("friend:response", {
        from: {
          id: userId,
          username: request.session.user?.username,
          avatar_url: request.session.user?.avatar_url,
        },
        accepted: accept,
        timestamp: new Date().toISOString(),
      });
    }

    response.json({
      success: true,
      message: accept ? "Friend request accepted" : "Friend request rejected",
    });
  } catch (error) {
    console.error("Error processing friend request:", error);
    response
      .status(500)
      .json({ success: false, error: "Failed to process friend request" });
  }
});

// Delete friend
router.delete("/:friendId", async (request: Request, response: Response) => {
  try {
    const { friendId } = request.params;
    const { id: userId } = request.session.user!;

    if (!userId) {
      response
        .status(401)
        .json({ success: false, error: "Unauthorized access" });
    }

    if (!friendId) {
      response
        .status(400)
        .json({ success: false, error: "Friend ID cannot be empty" });
    }

    const result = await Friends.deleteFriendship(userId, parseInt(friendId));

    if (!result) {
      response
        .status(404)
        .json({ success: false, error: "Friendship does not exist" });
    }

    const io = request.app.get("io");
    if (io) {
      io.to(friendId.toString()).emit("friend:removed", {
        by: {
          id: userId,
          username: request.session.user?.username,
          avatar_url: request.session.user?.avatar_url,
        },
        timestamp: new Date().toISOString(),
      });
    }

    response.json({
      success: true,
      message: "Friend removed",
    });
  } catch (error) {
    console.error("Error deleting friend:", error);
    response
      .status(500)
      .json({ success: false, error: "Failed to delete friend" });
  }
});

// Get friend requests list
router.get("/requests", async (request: Request, response: Response) => {
  try {
    const { id: userId } = request.session.user!;

    if (!userId) {
      response
        .status(401)
        .json({ success: false, error: "Unauthorized access" });
      return;
    }

    const requests = await Friends.getFriendRequests(userId);

    const formattedRequests = requests.map((request) => ({
      ...request,
      from: {
        id: request.user_id,
        username: request.username || "Unknown User",
        avatar_url: request.avatar_url,
        gravatar: request.gravatar,
      },
    }));

    response.json({ success: true, data: formattedRequests });
  } catch (error) {
    console.error("Error getting friend requests:", error);
    response
      .status(500)
      .json({ success: false, error: "Failed to get friend requests" });
  }
});

router.get("/chat/:friendId", async (request: Request, response: Response) => {
  try {
    const { friendId } = request.params;
    const { id: userId } = request.session.user!;

    if (!userId) {
      response
        .status(401)
        .json({ success: false, error: "Unauthorized access" });
      return;
    }

    const messages = await Friends.getChatHistory(userId, parseInt(friendId));

    response.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error getting chat history:", error);
    response.status(500).json({
      success: false,
      error: "Failed to get chat history",
    });
  }
});

router.post("/chat/:friendId", async (request: Request, response: Response) => {
  try {
    const { friendId } = request.params;
    const { id: userId } = request.session.user!;
    const { message } = request.body;

    if (!userId) {
      response
        .status(401)
        .json({ success: false, error: "Unauthorized access" });
      return;
    }

    const messageId = await Friends.saveMessage(
      userId,
      parseInt(friendId),
      message
    );

    // Send message to friend
    const io = request.app.get("io");
    const sender = request.session.user;
    const messageData = {
      id: messageId,
      content: message,
      sender: {
        id: userId,
        username: sender?.username,
        avatar_url: sender?.avatar_url,
        gravatar: sender?.gravatar,
      },
      timestamp: new Date().toISOString(),
    };

    io.to(userId.toString()).emit("friend:message", messageData);
    io.to(friendId.toString()).emit("friend:message", messageData);

    response.json({ success: true, data: messageData });
  } catch (error) {
    console.error("Error sending message:", error);
    response
      .status(500)
      .json({ success: false, error: "Failed to send message" });
  }
});

export default router;
