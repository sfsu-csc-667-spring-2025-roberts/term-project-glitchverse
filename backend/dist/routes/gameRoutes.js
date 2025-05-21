"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
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
*/
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../config/db"));
const router = express_1.default.Router();
// Fetch games from database
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query("SELECT id, name, description, image FROM games");
        // Ensure correct path prefix
        const updatedGames = result.rows.map(game => (Object.assign(Object.assign({}, game), { image: `http://localhost:3000${game.image}` })));
        res.json(updatedGames);
    }
    catch (error) {
        console.error("Error fetching games:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
exports.default = router;
