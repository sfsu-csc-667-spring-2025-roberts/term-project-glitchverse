import { Request, Response } from "express";
import db from "../config/db"; // Ensure database connection

export const getAllGames = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.execute("SELECT id, name, description, image FROM games");

    if (!Array.isArray(rows)) {
      throw new Error("Unexpected database response");
    }

    const games = rows.map((game: any) => ({
      ...game,
      image: `http://localhost:3000${game.image}`, // Ensuring full image URL
    }));

    res.json(games);
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({ message: "Server error" });
  }
};
