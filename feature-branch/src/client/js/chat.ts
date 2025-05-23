// Import necessary modules and types
import { ChatMessage } from "global";
import { socket } from "./sockets";
import { cloneTemplate, getGameId } from "./utils";

// DOM element references
const messageContainer = document.querySelector<HTMLDivElement>("#chat #messages");
const chatForm = document.querySelector<HTMLFormElement>("#chat form");
const chatInput = document.querySelector<HTMLInputElement>("#chat input");

// Socket.io listener for incoming chat messages
socket.on(`chat:message:${getGameId()}`, ({ message, sender, timestamp }: ChatMessage) => {
  // Clone message template from HTML
  const container = cloneTemplate<HTMLDivElement>("#chat-message-template");

  // Set avatar image source
  const img = container.querySelector<HTMLImageElement>("img")!;
  img.src = sender.avatar_url || `https://gravatar.com/avatar/${sender.gravatar}?d=identicon`;
  img.alt = `Avatar for ${sender.email}`;

  // Update message content and timestamp
  container.querySelector<HTMLSpanElement>("div span:first-of-type")!.innerText = message;
  container.querySelector<HTMLSpanElement>("div span:last-of-type")!.innerText =
    new Date(timestamp).toLocaleTimeString();

  // Append new message to container
  messageContainer!.appendChild(container);

  // Auto-scroll to bottom with smooth animation
  messageContainer?.scrollTo({
    top: messageContainer.scrollHeight,
    behavior: "smooth",
  });
});

// Handle form submission for sending messages
chatForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  // Get and validate message input
  const message = chatInput?.value;
  if (!message) return;

  // Clear input field
  chatInput.value = "";

  // Send message to server
  fetch(`/chat/${getGameId()}`, {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  }).catch((error) => {
    console.error("Error sending message:", error);
  });
});
