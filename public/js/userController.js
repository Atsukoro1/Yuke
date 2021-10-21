// Log-out user if button pressed
const logoutButton = document.getElementById('logUserOut');

logoutButton.addEventListener('click', () => {
    document.cookie = "token= ; expires = Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = "/login";
})