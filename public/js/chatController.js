// Socket client
const socket = io();

// We need that variable for listing through messages
let page = 0;

// Listen to every event happening on socket
socket.onAny((event, ...args) => {
    console.log(event, args);
});

// Listen to chat messages
socket.on('message', (message) => {
    // Get message container
    const messagesContainer = document.getElementById('messages');

    const chattingToId = document.getElementById('chattingTo').value;
    if (chattingToId == message.from) {
        // We are chatting with user that is currently selected as user to chat with

        // Create message element
        let messageElement = document.createElement('li');
        messageElement.innerText = message.content;
        messageElement.setAttribute('class', "messageOpponent");

        // Append element to message container
        messagesContainer.appendChild(messageElement);
    } else {
        // User is not selected as user to chat with

        alert('user is not selected');
    }
})


// CONTROL USER SELECTION IN CHAT
function selectUser(user) {
    // Get message container and clear all the previous messages
    const messagesContainer = document.getElementById('messages');
    messagesContainer.textContent = "";

    user = JSON.parse(user);

    // Display first 10 messages
    displayMessages(user._id, page);

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
    if (keyCode == 'Enter') {
        sendMessage();
        return false;
    }
});

// Display older messages when user clicks on "Display older messages"
const olderMessagesButton = document.getElementById("olderMessages");
olderMessagesButton.addEventListener('click', () => {
    if(page == 0) return olderMessagesButton.remove();
    displayMessages(document.getElementById('chattingTo').value, page)
})

function displayMessages(_id, pageToDisplay) {
    // Fetch messages from API
    let data = {
        _id: _id,
        page: pageToDisplay
    };
    fetch('/api/messages/get', {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) return;
            page = data.pages;

            data.documents[0].reverse();
            data.documents[0].forEach(message => {
                // Message container where we append all the messages
                const messageContainer = document.getElementById('messages');

                // Check if message author is user with currentl account
                const currentUserId = document.getElementById('userId').value;

                // Create message element
                let messageElement = document.createElement('li');
                messageElement.innerText = message.content;

                if (message.from == currentUserId) {
                    messageElement.setAttribute('class', "messageAuthor");
                } else {
                    messageElement.setAttribute('class', "messageOpponent");
                }

                // Append message element in message container
                messageContainer.prepend(messageElement);
            });
        })
}

// Send message
function sendMessage() {
    // Send the message to server
    let messageContent = messageInput.value;
    let sendToId = document.getElementById('chattingTo').value;
    let fromUserId = document.getElementById('userId').value;

    // send message data to server
    socket.emit("message", {
        content: messageContent,
        to: sendToId,
        from: fromUserId
    });

    // Get message container
    const messagesContainer = document.getElementById('messages');

    // Create message element
    let messageElement = document.createElement('li');
    messageElement.innerText = messageInput.value;
    messageElement.setAttribute('class', "messageAuthor");

    // Append message element in message container
    messagesContainer.appendChild(messageElement);

    // Clear content of the input
    messageInput.value = "";
}