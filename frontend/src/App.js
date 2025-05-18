import GameList from "./components/GameList.js";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("app").innerHTML = `
    <div>
      <h1>Welcome to the Game Platform</h1>
      ${GameList()}
    </div>
  `;
});
