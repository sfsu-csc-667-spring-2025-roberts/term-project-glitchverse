import express from "express";
import pool from "../database"; // Ensure this correctly connects to MySQL

const router = express.Router();

// Fetch games from database
router.get("/", async (req, res) => {
    try {
        const [games] = await pool.query("SELECT id, name, description, image FROM games");

        // Ensure correct path prefix
        const updatedGames = (games as any[]).map(game => ({
            ...game,
            image: `http://localhost:3000${game.image}`, // Adjust to your frontend URL
        }));

        res.json(updatedGames);
    } catch (error) {
        console.error("Error fetching games:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
