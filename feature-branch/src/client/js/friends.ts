import { socket } from "./sockets";

interface Friend {
  id: number;
  username: string;
  avatar_url: string;
  status: string;
}

interface FriendRequest {
  id: number;
  from: {
    id: number;
    username: string;
    avatar_url: string;
  };
  timestamp: string;
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
        myFriendsList.innerHTML = data.map((friend: Friend) => `
          <li data-id="${friend.id}">
            <img src="${friend.avatar_url}" alt="${friend.username}" class="friend-avatar">
            <div class="friend-info">
              <div class="friend-name">${friend.username}</div>
              <div class="friend-status">${friend.status || 'Offline'}</div>
            </div>
            <div class="friend-actions">
              <button class="btn-remove" data-id="${friend.id}">Remove</button>
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
    
    if (success) {
      const requestsList = document.querySelector("#friend-requests");
      if (requestsList) {
        requestsList.innerHTML = data.map((request: FriendRequest) => `
          <li>
            <img src="${request.from.avatar_url}" alt="${request.from.username}" class="friend-avatar">
            <div class="friend-info">
              <div class="friend-name">${request.from.username}</div>
              <div class="friend-status">Friend Request</div>
            </div>
            <div class="friend-actions">
              <button class="accept-button" data-id="${request.from.id}">Accept</button>
              <button class="reject-button" data-id="${request.from.id}">Reject</button>
            </div>
          </li>
        `).join("");
      }
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId, accept })
      });
      
      const result = await response.json();
      if (result.success) {
        updateFriendsList();
        updateFriendRequests();
      }
    } catch (error) {
      console.error("Handle friend request failed:", error);
    }
  }
});

// Delete friend
document.addEventListener("click", async (event) => {
  const target = event.target as HTMLElement;
  if (target.matches(".remove-button")) {
    const friendId = target.dataset.id;
    
    if (confirm("Are you sure you want to remove this friend?")) {
      try {
        const response = await fetch(`/friends/${friendId}`, {
          method: "DELETE"
        });
        
        const result = await response.json();
        if (result.success) {
          updateFriendsList();
        }
      } catch (error) {
        console.error("Failed to remove friend:", error);
      }
    }
  }
});

// Socket.IO 事件监听
socket.on("friend:request", (data: unknown) => {
  updateFriendRequests();
});

socket.on("friend:response", (data: unknown) => {
  updateFriendsList();
});

socket.on("friend:removed", (data: unknown) => {
  updateFriendsList();
});

// 初始化
updateFriendsList();
updateFriendRequests();

// 定期更新
setInterval(() => {
  updateFriendsList();
  updateFriendRequests();
}, 30000);


// 初始化社交中心
function initSocialCenter() {
  const socialModal = document.getElementById('social-center-modal');
  
  if (!socialModal) {
    console.error('Social center modal element not found');
    return;
  }

  // 打开社交中心弹窗
  document.getElementById('social-button')?.addEventListener('click', () => {
    (socialModal as HTMLElement).style.display = 'block';
    updateFriendsList();
    updateFriendRequests();
  });

  // 关闭社交中心弹窗
  socialModal.querySelector('.close-button')?.addEventListener('click', () => {
    (socialModal as HTMLElement).style.display = 'none';
  });

  // 显示好友添加弹窗时调整层级
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
      if(pane.id === `${tabId}-tab`) pane.classList.add('active');
    });
  });
});


document.addEventListener('DOMContentLoaded', initSocialCenter);