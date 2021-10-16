// Control settings window
const settingsOnButton = document.getElementById('settings');
const settingsOffButton = document.getElementById('settingsClose');
const settingsBackground = document.getElementById('settingsBackground');
const settingsGrid = document.getElementById('settingsGrid');

// Display settings window to user
settingsOnButton.addEventListener('click', () => {
    settingsGrid.style.display = "inline";
});

// Hide settings window from user
settingsOffButton.addEventListener('click', () => {
    settingsGrid.style.display = "none";
});

// Hide settings when user clicks on background
settingsBackground.addEventListener('click', () => {
    settingsGrid.style.display = "none";
});


// Control logout window
const logoutOnButton = document.getElementById('logout');
const logoutOffButton = document.getElementById('logoutClose');
const logoutBackground = document.getElementById('logoutBackground');
const logoutGrid = document.getElementById('logoutGrid');

// Display logout window to user
logoutOnButton.addEventListener('click', () => {
    logoutGrid.style.display = "inline";
});

// Hide logout window from user
logoutOffButton.addEventListener('click', () => {
    logoutGrid.style.display = "none";
});

// Hide logout window from user
logoutBackground.addEventListener('click', () => {
    logoutGrid.style.display = "none";
})


// Control friends window
const friendsOnButton = document.getElementById('friends');
const friendsOffButton = document.getElementById('friendsClose');
const friendsBackground = document.getElementById('friendsBackground');
const friendsGrid = document.getElementById('friendsGrid');

// Display logout window to user
friendsOnButton.addEventListener('click', () => {
    friendsGrid.style.display = "inline";
});

// Hide logout window from user
friendsOffButton.addEventListener('click', () => {
    friendsGrid.style.display = "none";
});

// Hide logout window from user
friendsBackground.addEventListener('click', () => {
    friendsGrid.style.display = "none";
})