// Interface for game room data structure
interface Game {
  id: number;
  status: string;
  name: string;
  player_count: number;
  max_players: number;
  password?: string;
}

// DOM element references
const createGameButton = document.querySelector("#create-game-button");
const createGameContainer = document.querySelector("#create-game-container");
const closeButton = document.querySelector("#close-create-game-form");

// Show create game modal
createGameButton?.addEventListener("click", (event) => {
  event.preventDefault();

  createGameContainer?.classList.add("visible");
});

// Close create game modal
closeButton?.addEventListener("click", (event) => {
  event.preventDefault();

  createGameContainer?.classList.remove("visible");
});

// Click background to close modal
createGameContainer?.addEventListener("click", (event) => {
  if (createGameContainer !== event.target) {
    return;
  }

  createGameContainer?.classList.remove("visible");
});

// Fetch and update game list from server
async function updateGamesList() {
  try {
    // Get game data from API
    const response = await fetch("/games/list");
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("sever Error:", errorText);
      return;
    }
    const { myGames, availableGames } = (await response.json()) as {
      myGames: Game[];
      availableGames: Game[];
    };

    // Update My Games section
    const myGamesList = document.querySelector("#my-games");
    if (myGamesList) {
      // Generate HTML for joined games
      myGamesList.innerHTML = (myGames || [])
        .map(
          (game) => `
        <li>
          <span class="status ${game.status || "waiting"}">${game.status || "waiting"}</span>
          <span class="game-name">${game.name || "Game"}</span>
          <span class="game-players">${isNaN(game.player_count) ? 0 : game.player_count}/${isNaN(game.max_players) ? 4 : game.max_players}</span>
          <a href="/games/${game.id}" class="button">Join</a>
        </li>
      `,
        )
        .join("");
    }

    // Update Available Games section  
    const availableGamesList = document.querySelector("#available-games");
    if (availableGamesList) {
      // Generate HTML for public games
      availableGamesList.innerHTML = (availableGames || [])
        .map(
          (game) => `
        <li>
          <span class="status waiting">waiting</span>
          <span class="game-name">${game.name || "Game"}</span>
          <span class="game-players">${isNaN(game.player_count) ? 0 : game.player_count}/${isNaN(game.max_players) ? 4 : game.max_players}</span>
          <form method="post" action="/games/join/${game.id}">
            ${game.password ? '<input type="text" name="password" />' : ""}
            <button type="submit">Join</button>
          </form>
        </li>
      `,
        )
        .join("");
    }
  } catch (error) {
    console.error("Failed to fetch game list:", error);
  }
}

// Initial load
updateGamesList();

// Refresh game list every 5 seconds
setInterval(updateGamesList, 5000);
