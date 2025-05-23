import { socket } from "./sockets";

interface Friend {
    id: number;
    username: string;
    avatar_url: string;
    gravatar: string;
    status: string;
}

interface FriendRequest {
    id: number;
    user_id: number;
    friend_id: number;
    status: string;
    created_at: string;
    from: {
        id: number;
        username: string;
        avatar_url?: string;
        gravatar: string;
    };
}

// Add friend button and modal related elements
const addFriendButton = document.querySelector("#add-friend-button");
const addFriendContainer = document.querySelector("#add-friend-container");
const closeAddFriendButton = document.querySelector("#close-add-friend-form");

// Show add friend modal
addFriendButton?.addEventListener("click", (event) => {
    event.preventDefault();
    addFriendContainer?.classList.add("visible");
});

// Close add friend modal
// Update close modal logic
closeAddFriendButton?.addEventListener("click", (event) => {
    event.preventDefault();
    const addFriendContainer = document.getElementById('add-friend-container');
    if (addFriendContainer) {
        addFriendContainer.style.display = 'none';
        // Restore social center z-index
        document.querySelector('.social-modal')?.classList.remove('blur-background');
    }
});

// Click background close modal
addFriendContainer?.addEventListener("click", (event) => {
    if (addFriendContainer !== event.target) {
        return;
    }
    addFriendContainer?.classList.remove("visible");
});

// Send friend request
const addFriendForm = document.querySelector("#add-friend-form");
addFriendForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const friendIdInput = document.querySelector("#friend-id") as HTMLInputElement;
    const friendId = parseInt(friendIdInput.value.trim(), 10);

    if (isNaN(friendId)) {
        alert("Please enter a valid friend ID");
        return;
    }

    try {
        const response = await fetch("/friends/request", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({ friendId })
        });

        const result = await response.json();
        if (result.success) {
            alert("Friend request sent successfully");
            addFriendContainer?.classList.remove("visible");
            friendIdInput.value = ""; // Clear input
            await updateFriendRequests(); // Update request list immediately
        } else {
            alert(result.error || "Failed to send friend request");
        }
    } catch (error) {
        console.error("Failed to send friend request:", error);
        alert("Failed to send friend request, please try again later");
    }
});

// Update friends list
async function updateFriendsList() {
    try {
        const response = await fetch("/friends/list");
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Server Error:", errorText);
            return;
        }
        const { success, data } = await response.json();

        if (success && data) {
            const myFriendsList = document.querySelector("#my-friends");
            if (myFriendsList) {
                // Update friends list HTML content
                myFriendsList.innerHTML = data.map((friend: Friend) => `
          <li class="friend-request-item">
            <div class="friend-request-content">
              <div class="friend-avatar-container">
                <img class="friend-avatar" 
                     src="${friend.avatar_url || `https://gravatar.com/avatar/${friend.gravatar}?d=identicon`}" 
                     alt="${friend.username || 'Unknown User'}"
                >
              </div>
              <div class="friend-info">
                <div class="friend-name">${friend.username || 'Unknown User'}</div>
                <div class="friend-status">${friend.status || 'Offline'}</div>
              </div>
            </div>
            <div class="friend-actions">
              <button class="chat-button" data-id="${friend.id}" data-username="${friend.username}">
                <i class="nf nf-md-chat"></i> Chat
              </button>
              <button class="delete-button" data-id="${friend.id}">Remove Friend</button>
            </div>
          </li>
        `).join("");
            }
        }
    } catch (error) {
        console.error("Failed to fetch friends list:", error);
    }
}

// Update friend requests list
async function updateFriendRequests() {
    try {
        const response = await fetch("/friends/requests");
        const { success, data } = await response.json();

        if (success && Array.isArray(data)) {
            const requestsList = document.querySelector("#friend-requests");
            if (requestsList) {
                requestsList.innerHTML = data.map((request: FriendRequest) => {
                    const fromUser = request.from || {
                        id: request.user_id,
                        username: 'Unknown User',
                        avatar_url: '/images/default-avatar.png'
                    };

                    return `
            <li class="friend-request-item">
              <div class="friend-request-content">
                <div class="friend-avatar-container">
                  <img class="friend-avatar" src="${fromUser.avatar_url || 'https://gravatar.com/avatar/${fromUser.gravatar}?d=identicon'}" 
                       alt="${fromUser.username}" 
                       >
                </div>
                <div class="friend-info">
                  <div class="friend-name">${fromUser.username}</div>
                  <div class="friend-status">Friend Request</div>
                </div>
              </div>
              <div class="friend-actions">
                <button class="reject-button" data-id="${request.user_id}">Reject</button>
                <button class="accept-button" data-id="${request.id}">Accept</button>
              </div>
            </li>
          `;
                }).join("");
            }
        } else {
            console.error("Invalid response format:", data);
        }
    } catch (error) {
        console.error("Failed to fetch friend requests:", error);
    }
}

// Handle friend request response
document.addEventListener("click", async (event) => {
    const target = event.target as HTMLElement;
    if (target.matches(".accept-button, .reject-button")) {
        const friendId = target.dataset.id;
        const accept = target.classList.contains("accept-button");

        try {
            const response = await fetch("/friends/respond", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ friendId: parseInt(friendId!, 10), accept })
            });

            const result = await response.json();
            if (result.success) {
                await updateFriendsList();
                await updateFriendRequests();
            } else {
                alert(result.error || "Failure to process a friend request");
            }
        } catch (error) {
            console.error("Handle friend request failed:", error);
            alert("An error occurred while processing a friend request. Please try again later.");
        }
    }
});

// Delete friend handler
document.addEventListener("click", async (event) => {
    const target = event.target as HTMLElement;
    if (target.matches(".delete-button") && target.closest("#my-friends")) {
        const friendId = target.dataset.id;
        if (!friendId) return;

        try {
            const response = await fetch(`/friends/${friendId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                credentials: "include"
            });

            const result = await response.json();
            if (result.success) {
                // Delete successfully, refresh friend list
                await updateFriendsList();
            } else {
                // Deletion failed, displays an error message
                alert(result.error || "Delete friend failed, please try again later");
            }
        } catch (error) {
            console.error("Failed to delete friend:", error);
            alert("Delete friend failed, please try again later");
        }
    }
});

// Socket.IO event listeners
socket.on("friend:request", (data: FriendRequest) => {
    updateFriendRequests();
});

socket.on("friend:response", (data: unknown) => {
    updateFriendsList();
});

socket.on("friend:removed", (data: unknown) => {
    updateFriendsList();
});

// Initialize
updateFriendsList();
updateFriendRequests();

// Periodic updates
setInterval(() => {
    updateFriendsList();
    updateFriendRequests();
}, 30000);


// Initialize social center
function initSocialCenter() {
    const socialModal = document.getElementById('social-center-modal');

    if (!socialModal) {
        console.error('Social center modal element not found');
        return;
    }

    // Open social center modal
    document.getElementById('social-button')?.addEventListener('click', () => {
        (socialModal as HTMLElement).style.display = 'block';
        updateFriendsList();
        updateFriendRequests();
    });

    // Close social center modal
    socialModal.querySelector('.close-button')?.addEventListener('click', () => {
        (socialModal as HTMLElement).style.display = 'none';
    });

    // Show add friend modal and adjust z-index
    document.getElementById('add-friend-button')?.addEventListener('click', () => {
        const addFriendContainer = document.getElementById('add-friend-container');
        if (addFriendContainer) {
            addFriendContainer.style.zIndex = '1001';
            addFriendContainer.style.display = 'block';
        }
    });
}

const tabs = document.querySelectorAll('.tab');


tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const tabId = tab.getAttribute('data-tab');
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === `${tabId}-tab`) pane.classList.add('active');
        });
    });
});


document.addEventListener('DOMContentLoaded', initSocialCenter);
document.addEventListener("click", async (event) => {
    const target = event.target as HTMLElement;

    // Handle chat button click
    if (target.matches(".chat-button")) {
        const friendId = target.dataset.id;
        console.log(friendId);
        const friendUsername = target.dataset.username;

        // Switch to the Recent Chats tab
        const chatTab = document.querySelector('[data-tab="chats"]') as HTMLElement;
        if (chatTab) {
            // Remove active classes from other tags
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

            // Activate chats tab
            chatTab.classList.add('active');
            const chatsPane = document.querySelector('#chats-tab');
            if (chatsPane) {
                chatsPane.classList.add('active');

                // Create chat interface
                const chatHistory = chatsPane.querySelector('.chat-history');
                if (chatHistory && friendId) {  // Add null checking for friendId
                    chatHistory.innerHTML = `
            <div class="chat-container" data-friend-id="${friendId}">
              <div class="chat-header">
                <span class="chat-title">Chatting with ${friendUsername} </span>
              </div>
              <div class="messages-container"></div>
              <div class="chat-input-container">
                <input type="text" class="chat-input" placeholder="Enter a message..." />
                <button class="send-button">Send</button>
              </div>
            </div>
          `;

                    // Load history messages
                    loadChatHistory(friendId);

                    // Setting up a timed refresh
                    const refreshInterval = setInterval(() => {
                        loadChatHistory(friendId);
                    }, 3000);

                    // Binding the send message event
                    const input = chatHistory.querySelector('.chat-input') as HTMLInputElement;
                    const sendButton = chatHistory.querySelector('.send-button');

                    // Add a send button click event
                    sendButton?.addEventListener('click', async () => {
                        const message = input.value.trim();
                        if (message && friendId) {
                            await sendMessage(parseInt(friendId), message);
                            input.value = '';

                            // Updated chat interface
                            const messagesContainer = document.querySelector(
                                `.chat-container[data-friend-id="${friendId}"] .messages-container`
                            );
                            if (messagesContainer) {
                                const messageElement = document.createElement('div');
                                messageElement.className = 'message sent';
                                messageElement.innerHTML = `
                  <div class="message-content">${message}</div>
                  <div class="message-time">${new Date().toLocaleTimeString()}</div>
                `;
                                messagesContainer.appendChild(messageElement);
                                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                            }
                        }
                    });

                    // Add "enter" to send function
                    input?.addEventListener('keypress', async (e) => {
                        if (e.key === 'Enter') {
                            const message = input.value.trim();
                            if (message && friendId) {
                                await sendMessage(parseInt(friendId), message);
                                input.value = '';

                                // Updated chat interface
                                const messagesContainer = document.querySelector(
                                    `.chat-container[data-friend-id="${friendId}"] .messages-container`
                                );
                                if (messagesContainer) {
                                    const messageElement = document.createElement('div');
                                    messageElement.className = 'message sent';
                                    messageElement.innerHTML = `
                    <div class="message-content">${message}</div>
                    <div class="message-time">${new Date().toLocaleTimeString()}</div>
                  `;
                                    messagesContainer.appendChild(messageElement);
                                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                                }
                            }
                        }
                    });
                }
            }
        }
    }
});

// Load Chat History
async function loadChatHistory(friendId: string) {
    try {
        const response = await fetch(`/friends/chat/${friendId}`);
        const { success, data: messages } = await response.json();

        if (success && messages) {
            const messagesContainer = document.querySelector(`.chat-container[data-friend-id="${friendId}"] .messages-container`);
            if (messagesContainer) {
                messagesContainer.innerHTML = messages.map((msg: any) => `
          <div class="message ${msg.fromId === parseInt(friendId) ? 'received' : 'sent'}">
            <div class="message-content">${msg.content}</div>
            <div class="message-time">${new Date(msg.timestamp).toLocaleTimeString()}</div>
          </div>
        `).join('');

                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }
    } catch (error) {
        console.error('Failed to load chat log:', error);
    }
}

// Listening for incoming messages
socket.on('chat:message', (data: { from: string; content: string; timestamp: string }) => {
    const { from, content, timestamp } = data;
    const messagesContainer = document.querySelector(`.chat-container[data-friend-id="${from}"] .messages-container`);

    if (messagesContainer) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message received';
        messageElement.innerHTML = `
      <div class="message-content">${content}</div>
      <div class="message-time">${new Date(timestamp).toLocaleTimeString()}</div>
    `;
        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});

// sendMessage function 
async function sendMessage(friendId: number, message: string) {
    try {
        const response = await fetch(`/friends/chat/${friendId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Failed to send message');
        }

        // Updating the chat interface for each other
        socket.emit('friend:message', {
            to: friendId,
            message,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Failed to load chat history:', error);
        console.error('Error sending message:', error);
        alert('Failed to process friend request');
        alert('Failed to delete friend, please try again later');
        throw error;
    }
}
