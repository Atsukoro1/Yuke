// Socket client
const socket = io();

// Listen to every event happening on socket
socket.onAny((event, ...args) => {
    console.log(event, args);
});

// Listen to chat messages
socket.on('message', (message) => {
    console.log(message);
})


// CONTROL USER SELECTION IN CHAT
function selectUser(user) {
    user = JSON.parse(user);
    
    const username = document.getElementById('actualProfileUsermame');
    const profilePicture = document.getElementById('actualProfilePfp');
    const chattingToInput = document.getElementById('chattingTo');

    chattingToInput.setAttribute('value', user._id);
    username.innerText = user.username;
    profilePicture.setAttribute("src", "https://www.gravatar.com/avatar/" + user.email + "?d=retro")
}

// CONTROL MESSAGE SENDING 

// When user tries to send a message
const messageInput = document.getElementById('messageInput');
const messageSendButton = document.getElementById('messageButton');

// Try to send message when user clicks the "send message" button
messageSendButton.addEventListener('click', () => {
    sendMessage();
})

// Try to send message when user entered the message input and pressed enter
messageInput.addEventListener('keydown', (key) => {
    if (!key) key = window.event;
    var keyCode = key.code || key.key;
    if (keyCode == 'Enter'){
      sendMessage();
      return false;
    }
});

// Send message
function sendMessage() {
    // Send the message to server
    let messageContent = messageInput.value;
    let sendToId = document.getElementById('chattingTo').value;
    let fromUserId = document.getElementById('userId').value;

    socket.emit("message", {
        content: messageContent,
        to: sendToId,
        from: fromUserId
    });

    // Clear content of the input
    messageInput.value = "";
}