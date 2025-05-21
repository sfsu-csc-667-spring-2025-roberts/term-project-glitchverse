export function createGameCard(game: { id: number; name: string; description: string; image: string }) {
  const gameCard = document.createElement("div");
  gameCard.classList.add("card", "m-2", "p-3");
  gameCard.style.width = "18rem";

  // Construct the correct image URL
  const imageUrl = game.image.startsWith("/assets/")
    ? `http://localhost:3000${game.image}`
    : game.image;

  gameCard.innerHTML = `
      <img src="${imageUrl}" class="card-img-top" alt="${game.name}" style="height: 150px; object-fit: cover;">
      <div class="card-body">
          <h3 class="card-title">${game.name}</h3>
          <p class="card-text">${game.description}</p>
          <button class="play-button btn btn-primary" data-id="${game.id}">Play</button>
      </div>
  `;

  return gameCard;
}
