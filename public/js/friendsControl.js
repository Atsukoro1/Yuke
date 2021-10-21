// Notification library
const notyf = new Notyf({
    types: [
      {
        type: 'error',
        background: '#7C3AED',
        dismissible: true
      },
      {
        type: 'success',
        background: '#7C3AED',
        dismissible: true
      }
    ]
});

function makeRequest(_id, href, passText) {
    if(!_id) return notyf.error("Please enter a user id");

    let body = { _id: _id };
    fetch('/api/friends/' + href, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if(data.error) return notyf.error(data.error);
        return notyf.success(passText);
    })
}

// Triggered when user tries to add a friend
function addFriend(_id) {
    makeRequest(_id, "/add", "Successfully added a new friend!");
}

// Triggered when user tries to remove a friend
function removeFriend(_id) {
    makeRequest(_id, "/remove", "Successfully removed friend!");
    document.getElementById(_id).remove();
}

// Triggered when user blocks someone
function blockUser(_id) {
    makeRequest(_id, "/block", "Successfully blocked user!");
    document.getElementById(_id).remove();
}

// Triggered when user accepts a friend request
function acceptFriendRequest(_id) {
    makeRequest(_id, "/accept", "Successfully accepted friend request!");
    document.getElementById(_id).remove();
}

// Triggered when user deny friend request
function declineFriendRequest(_id) {
    makeRequest(_id, "/decline", "Successfully declined friend request!");
    document.getElementById(_id).remove();
}