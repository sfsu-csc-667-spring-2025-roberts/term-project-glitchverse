import { createGameCard } from "../components/GameCard";

interface Game {
  id: number;
  name: string;
  description: string;
  image: string;
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("http://localhost:5000/api/games");
    const games: Game[] = await response.json(); // Explicitly typing `games`

    const gameListContainer = document.getElementById("gameList") as HTMLElement;
    gameListContainer.innerHTML = "";

    games.forEach((game: Game) => {
      const gameCard = createGameCard(game);
      gameListContainer.appendChild(gameCard);
    });

  } catch (error) {
    console.error("Error fetching games:", error);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const userIcon = document.getElementById("userIcon");
  const dropdown = document.getElementById("userDropdown");

  if (userIcon && dropdown) {
    userIcon.addEventListener("click", () => {
      dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    });
  }

  // Optional: Handle logout click
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token"); // Simulated logout
      alert("Logged out!");
    });
  }
});

