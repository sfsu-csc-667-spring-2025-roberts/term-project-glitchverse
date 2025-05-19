import { getGameId } from "./utils";

const startGameButton = document.querySelector("#start-game-button");
const leaveGameButton = document.querySelector("#leave-game-button");

startGameButton?.addEventListener("click", (event) => {
  event.preventDefault();

  fetch(`/games/${getGameId()}/start`, {
    method: "post",
  });
});

leaveGameButton?.addEventListener("click", async (event) => {
  event.preventDefault();

  try {
    const response = await fetch(`/games/${getGameId()}/leave`, {
      method: "POST",
    });

    const data = await response.json();

    if (data.success) {
      if (data.remainingPlayers === 0) {
        await fetch(`/games/${getGameId()}/delete`, {
          method: "POST",
        });
      }
      window.location.href = "/lobby";
    } else {
      console.error("Failed to leave game:", data.error);
    }
  } catch (error) {
    console.error("Error leaving game:", error);
  }
});
