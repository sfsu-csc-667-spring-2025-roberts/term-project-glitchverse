document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:5000/api/games")
      .then(response => response.json())
      .then(games => {
          const gameListContainer = document.getElementById("gameList") as HTMLElement;
          gameListContainer.innerHTML = "";

          games.forEach((game: { id: number; name: string; description: string }) => {
              const gameCard = document.createElement("div");
              gameCard.classList.add("card", "m-2", "p-3");

              gameCard.innerHTML = `
                  <h3>${game.name}</h3>
                  <p>${game.description}</p>
                  <button class="play-button btn btn-success" data-id="${game.id}">Play</button>
              `;

              gameListContainer.appendChild(gameCard);
          });

          // Attach event listeners to Play buttons
          document.querySelectorAll(".play-button").forEach(button => {
              button.addEventListener("click", (event) => {
                  const gameId = (event.target as HTMLButtonElement).dataset.id;
                  if (gameId === "1") {
                      window.location.href = "bingo.html"; // Navigates to Bingo
                  } else {
                      alert("Game not available yet!");
                  }
              });
          });
      })
      .catch(error => console.error("Error fetching games:", error));
});
