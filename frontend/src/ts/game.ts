import { io } from "socket.io-client";
const socket = io("http://localhost:5000"); // Adjust if hosted differently

const requestCardBtn = document.getElementById("requestCard")!;
const drawNumberBtn = document.getElementById("drawNumber")!;
const checkWinBtn = document.getElementById("checkWin")!;
const lastNumberSpan = document.getElementById("lastNumber")!;
const bingoBoard = document.getElementById("bingoBoard")!;
const chatBox = document.getElementById("chatBox")!;
const sendMessageBtn = document.getElementById("sendMessage")!;
const chatInput = document.getElementById("chatMessage")! as HTMLInputElement;

let currentCard: number[][] = [];

requestCardBtn.addEventListener("click", () => {
  socket.emit("requestCard");
});

drawNumberBtn.addEventListener("click", () => {
  socket.emit("drawNumber");
});

checkWinBtn.addEventListener("click", () => {
  socket.emit("checkWin", currentCard);
});

sendMessageBtn.addEventListener("click", () => {
  const message = chatInput.value.trim();
  if (message) {
    socket.emit("chatMessage", message);
    chatInput.value = "";
  }
});

socket.on("newCard", (card: number[][]) => {
  currentCard = card;
  renderCard(card);
});

socket.on("numberDrawn", (number: number) => {
  lastNumberSpan.textContent = number.toString();
  markNumber(number);
});

socket.on("winStatus", (status: string) => {
  alert(status);
});

socket.on("chatMessage", (msg: string) => {
  const p = document.createElement("p");
  p.textContent = msg;
  chatBox.appendChild(p);
});

function renderCard(card: number[][]) {
  bingoBoard.innerHTML = "";
  card.forEach(row => {
    const rowDiv = document.createElement("div");
    row.forEach(num => {
      const cell = document.createElement("span");
      cell.textContent = num.toString();
      cell.className = "bingo-cell";
      rowDiv.appendChild(cell);
    });
    bingoBoard.appendChild(rowDiv);
  });
}

function markNumber(num: number) {
  const cells = document.querySelectorAll(".bingo-cell");
  cells.forEach(cell => {
    if (cell.textContent === num.toString()) {
      cell.classList.add("marked");
    }
  });
}
