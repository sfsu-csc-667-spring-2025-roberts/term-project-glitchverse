import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
    res.send("Hello, World from Team 13 GlitchVerse");
});

export default router;