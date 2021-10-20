async function fetchData() {
    await fetch('api/auth/me', {
        method: "GET"
    })
    .then(response => response.json())
    .then(data => {
        return data;
    })
}

function updateUser() {
    const username = document.getElementById('username');
    const profilePicture = document.getElementById('profilePicture');
}