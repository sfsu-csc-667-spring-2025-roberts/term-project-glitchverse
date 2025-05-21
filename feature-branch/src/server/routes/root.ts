import express from "express";
import { Request, Response } from "express";

const router = express.Router();

/*
router.get("/", (_request: Request, response: Response) => {
  response.render("root");
});
*/

router.get("/", (request: Request, response: Response) => {
  response.render("home", {
    user: request.session.user || null,
    games: [
      {
        id: "bingo",
        name: "Bingo",
        description: "Classic Number Matching Game",
      },
      {
        id: "uno",
        name: "UNO",
        description: "The world's most popular card game",
      },
      // ... other games
    ],
  });
});

export default router;
