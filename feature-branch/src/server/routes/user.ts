import express from "express";
import { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import db from "../db/connection";
import bcrypt from "bcrypt";
import {
  GET_USER_PASSWORD,
  UPDATE_USER_PASSWORD,
  UPDATE_USERNAME,
  UPDATE_AVATAR,
  GET_USER_AVATAR,
} from "../db/users/sql";

const router = express.Router();
const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/uploads/avatars",
    filename: (requestuest, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname),
      );
    },
  }),
});

// Profile page route
router.get("/profile", (request: Request, response: Response) => {
  // @ts-ignore
  response.render("user/profile", {
    user: request.session.user,
  });
});

// Update profile information
router.post("/profile", async (request: Request, response: Response) => {
  try {
    const { username, current_password, new_password } = request.body;
    // @ts-ignore
    const userId = request.session.user.id;

    const { password: storedPassword } = await db.one(GET_USER_PASSWORD, [
      userId,
    ]);

    if (current_password && new_password) {
      const isValidPassword = await bcrypt.compare(
        current_password,
        storedPassword,
      );
      console.log("isValidPassword:", isValidPassword);
      if (!isValidPassword) {
        return response.render("user/profile", {
          user: request.session.user,
          error: "Current password is incorrect",
        });
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);
      await db.none(UPDATE_USER_PASSWORD, [hashedPassword, userId]);
    }

    if (username) {
      await db.none(UPDATE_USERNAME, [username, userId]);
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

      const responseult = await db.oneOrNone(GET_USER_AVATAR, [userId]);
      const oldAvatarUrl = responseult?.avatar_url;

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

      await db.none(UPDATE_AVATAR, [avatarUrl, userId]);

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
  },
);

export default router;
