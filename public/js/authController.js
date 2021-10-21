const onAuthClickButton = document.getElementById("loginButton") || document.getElementById("registerButton");
const authType = document.getElementById("loginButton") ? "login" : "register";

function authenticate() {
    let data = {};

    let email = document.getElementById('email');
    let password = document.getElementById('password');
    let username = document.getElementById('username');

    if(email) data['email'] = email.value;
    if(password) data['password'] = password.value;

    // We are not working with username while logging in
    if(authType == "register") data['username'] = username.value;

    fetch('/api/auth/' + authType, {
        body: JSON.stringify(data),
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        // Create an instance of Notyf
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

        // Check if some error happened
        if(data.error) return notyf.error(data.error);

        // Save token and redirect to chat
        document.cookie = "token=" + data.token;
        window.location.href = "/";
    })
}

// Try to authenticate when user clicks button
onAuthClickButton.addEventListener('click', () => {
    authenticate();
})

// Try to authenticate when user press the "Enter" key
document.addEventListener('keydown', (key) => {
    if(key.code == "Enter") {
        authenticate();
    }
})