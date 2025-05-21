import { getGameId } from "./utils";
import { socket } from "./sockets";

let isMyTurn = false;
let gameEnded = false;

const startGameButton = document.querySelector("#start-game-button");
const leaveGameButton = document.querySelector("#leave-game-button");
const getNumberButton = document.querySelector(
  "#get-number-button",
) as HTMLButtonElement;

function createNewGameButton(gameControls: Element) {
  if (!document.querySelector("#new-game-button")) {
    const newGameButton = document.createElement("button");
    newGameButton.id = "new-game-button";
    newGameButton.textContent = "Start New Game";
    newGameButton.onclick = () => {
      window.location.href = `/games/${getGameId()}`;
    };
    gameControls.appendChild(newGameButton);
  }
}

function disableGetNumberButton() {
  if (getNumberButton) {
    getNumberButton.disabled = true;
  }
}

function updateGetNumberButton() {
  if (gameEnded) {
    disableGetNumberButton();
    return;
  }

  if (getNumberButton) {
    getNumberButton.disabled = !isMyTurn;
    getNumberButton.textContent = isMyTurn
      ? "Your Turn to Draw"
      : "Waiting for Others";
  }
}

startGameButton?.addEventListener("click", (event) => {
  event.preventDefault();
  fetch(`/games/${getGameId()}/start`, {
    method: "post",
  }).then(() => {
    window.location.href = `/games/${getGameId()}/play`;
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
        await fetch(`/games/${getGameId()}/delete`, { method: "POST" });
      }
      window.location.href = "/lobby";
    }
  } catch (error) {
    console.error("Error leaving game:", error);
  }
});

function generateBingoCard() {
  const grid = document.querySelector(".bingo-grid");
  if (!grid) return;

  grid.innerHTML = "";
  const columns = {
    B: generateRandomNumbers(1, 15, 5),
    I: generateRandomNumbers(16, 30, 5),
    N: generateRandomNumbers(31, 45, 5),
    G: generateRandomNumbers(46, 60, 5),
    O: generateRandomNumbers(61, 75, 5),
  };

  const cardNumbers: number[] = [];
  Object.entries(columns).forEach(([letter, numbers]) => {
    numbers.forEach((number) => {
      const cell = document.createElement("div");
      cell.className = "bingo-cell";
      cell.textContent = number.toString();
      cell.dataset.number = number.toString();
      cell.dataset.column = letter;
      grid.appendChild(cell);
      cardNumbers.push(number);
    });
  });

  socket.emit(`game:card:${getGameId()}`, cardNumbers);
}

function generateRandomNumbers(
  min: number,
  max: number,
  count: number,
): number[] {
  const numbers = new Set<number>();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(numbers);
}

const announcedLines = new Set<string>();

function markNumber(number: number) {
  const cells = document.querySelectorAll(".bingo-cell");
  cells.forEach((cell) => {
    if (
      cell instanceof HTMLElement &&
      cell.dataset.number === number.toString()
    ) {
      cell.classList.add("marked");
      checkLine();
    }
  });
}

function checkLine() {
  const cells = Array.from(document.querySelectorAll(".bingo-cell"));
  const markedCells = cells.map((cell) => cell.classList.contains("marked"));

  const checkAndAnnounce = (indices: number[], type: string, key: string) => {
    if (!announcedLines.has(key) && indices.every((i) => markedCells[i])) {
      announceLineInChat(type);
      announcedLines.add(key);
    }
  };

  // Check rows
  for (let i = 0; i < 5; i++) {
    checkAndAnnounce(
      Array.from({ length: 5 }, (_, j) => i * 5 + j),
      "row",
      `row-${i}`,
    );
  }

  // Check columns
  for (let i = 0; i < 5; i++) {
    checkAndAnnounce(
      Array.from({ length: 5 }, (_, j) => i + j * 5),
      "column",
      `col-${i}`,
    );
  }

  // Check diagonals
  checkAndAnnounce([0, 6, 12, 18, 24], "main diagonal", "diag-main");
  checkAndAnnounce([4, 8, 12, 16, 20], "anti-diagonal", "diag-sub");

  if (markedCells.every((marked) => marked)) {
    announceWin();
  }
}

function announceLineInChat(lineType: string) {
  fetch(`/chat/${getGameId()}`, {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: `Completed a ${lineType}!` }),
  }).catch((error) => console.error("Error sending line announcement:", error));
}

function announceWin() {
  gameEnded = true;
  socket.emit(`game:winner:${getGameId()}`);
  disableGetNumberButton();

  fetch(`/chat/${getGameId()}`, {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "🎉 Congratulations! I won the game!" }),
  }).catch((error) => console.error("Error sending win message:", error));

  showNewGameButtonIfHost();
}

function showNewGameButtonIfHost() {
  const isHost =
    document.querySelector<HTMLInputElement>("#is-host")?.value === "true";
  if (isHost) {
    const gameControls = document.querySelector(".game-controls");
    if (gameControls && !document.querySelector("#new-game-button")) {
      createNewGameButton(gameControls);
    }
  }
}

socket.on(`game:winner:${getGameId()}`, () => {
  console.log("收到游戏结束事件");
  gameEnded = true;
  disableGetNumberButton();
  showNewGameButtonIfHost();
});

socket.on(`game:number:${getGameId()}`, markNumber);
socket.on(`game:start:${getGameId()}`, () => {
  window.location.href = `/games/${getGameId()}/play`;
});

socket.on(`game:turn:${getGameId()}`, (currentPlayerId: number) => {
  if (gameEnded) return;
  const myId = parseInt(
    document.querySelector<HTMLInputElement>("#user-id")?.value || "0",
  );
  isMyTurn = currentPlayerId === myId;
  updateGetNumberButton();
});

getNumberButton?.addEventListener("click", async (event) => {
  event.preventDefault();
  if (gameEnded) return;

  try {
    const response = await fetch(`/games/${getGameId()}/number`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to get number");

    const data = await response.json();
    const calledNumberDiv = document.querySelector("#called-number");
    if (calledNumberDiv) {
      calledNumberDiv.textContent = `Current Number: ${data.number}`;
    }

    socket.emit(`game:number:${getGameId()}`, data.number);

    fetch(`/chat/${getGameId()}`, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `Drew number: ${data.number}` }),
    }).catch((error) =>
      console.error("Error sending number announcement:", error),
    );
  } catch (error) {
    console.error("Error getting number:", error);
    alert("Failed to get number, please try again");
  }
});

// Initialize game
window.addEventListener("load", () => {
  const gameTable = document.querySelector("#game-table");
  if (!gameTable) {
    console.error("Game area not found");
    return;
  }

  generateBingoCard();
});
