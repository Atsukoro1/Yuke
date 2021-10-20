const onAuthClickButton = document.getElementById("loginButton") || document.getElementById("registerButton");
const authType = document.getElementById("loginButton") ? "login" : "register";

onAuthClickButton.addEventListener('click', () => {
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
        var notyf = new Notyf();

        // Check if some error happened
        if(data.error) return notyf.error(data.error);

        // Save token and redirect to chat
        document.cookie = "token=" + data.token;
        window.location.href = "/";
    })
})