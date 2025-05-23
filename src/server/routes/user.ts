import express from "express";
import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { User } from "../db";

const router = express.Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads/avatars",
    filename: (requestuest, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
      );
    },
  }),
});

// Profile page route
router.get("/profile", async (request: Request, response: Response) => {
  try {
    // @ts-ignore
    const userId = request.session.user.id;

    const updatedUser = await User.getById(userId);

    request.session.user = updatedUser;

    response.render("user/profile", {
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    response.render("user/profile", {
      user: request.session.user,
      error: "Failed to fetch latest user data",
    });
  }
});

// Update profile information
router.post("/profile", async (request: Request, response: Response) => {
  try {
    const { username, current_password, new_password } = request.body;
    // @ts-ignore
    const userId = request.session.user.id;

    if (current_password && new_password) {
      const isValidPassword = await User.validatePassword(
        userId,
        current_password
      );

      if (!isValidPassword) {
        return response.render("user/profile", {
          user: request.session.user,
          error: "Current password is incorrect",
        });
      }

      await User.updatePassword(userId, new_password);
    }

    if (username) {
      await User.updateUsername(userId, username);
      // @ts-ignore
      request.session.user.username = username;
    }

    response.render("user/profile", {
      user: request.session.user,
      success: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    response.render("user/profile", {
      user: request.session.user,
      error: "Failed to update profile",
    });
  }
});

router.post(
  "/avatar",
  upload.single("avatar"),
  async (request: Request, response: Response) => {
    try {
      if (!request.file) {
        throw new Error("No file uploaded");
      }

      // @ts-ignore
      const userId = request.session.user.id;

      const oldAvatarUrl = await User.getAvatarUrl(userId);

      if (oldAvatarUrl) {
        const oldAvatarPath = path.join(process.cwd(), "public", oldAvatarUrl);
        try {
          if (fs.existsSync(oldAvatarPath)) {
            fs.unlinkSync(oldAvatarPath);
          }
        } catch (err) {
          console.error("Error deleting old avatar:", err);
        }
      }

      const avatarUrl = `/uploads/avatars/${request.file.filename}`;
      await User.updateAvatar(userId, avatarUrl);

      // @ts-ignore
      request.session.user.avatar_url = avatarUrl;

      response.render("user/profile", {
        user: request.session.user,
        success: "Avatar updated successfully",
      });
    } catch (error) {
      console.error("Avatar update error:", error);
      response.render("user/profile", {
        user: request.session.user,
        error: "Failed to update avatar",
      });
    }
  }
);

export default router;
