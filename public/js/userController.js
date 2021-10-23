// Log-out user if button pressed
function logout() {
    document.cookie = "token= ; expires = Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = "/login";
}

function changeEmail() {
    const email = document.getElementById('newEmail').value;
    const password = document.getElementById('emailPass').value;

    let data = { newEmail: email, password: password };
    fetch('/api/settings/changeemail', {
        method: "POST", 
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if(data.error) return notyf.error(data.error);

        return notyf.error("Your E-mail changed.")
    });
}

function changeUsername() {
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('usernamePass').value;

    let data = { newUsername: username, password: password };
    fetch('/api/settings/changeusername', {
        method: "POST", 
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if(data.error) return notyf.error(data.error);

        return notyf.error("Your username changed.")
    });
}

function changePassword() {
    const oldPassword = document.getElementById('oldPass').value;
    const newPassword = document.getElementById('newPass').value;

    let data = { newPassword: newPassword, password: oldPassword };
    fetch('/api/settings/changepassword', {
        method: "POST", 
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if(data.error) return notyf.error(data.error);

        return notyf.error("Your password changed.")
    });
}
