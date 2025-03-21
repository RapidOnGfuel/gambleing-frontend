document.addEventListener('DOMContentLoaded', () => {
    // Populate the leaderboard
    const leaderboardData = [
        { rank: 1, username: 'User123', balance: '$10,000' },
        { rank: 2, username: 'Gamer456', balance: '$9,500' },
        { rank: 3, username: 'Ace789', balance: '$9,000' },
        { rank: 4, username: 'LuckyGuy', balance: '$8,500' },
        { rank: 5, username: 'HighRoll', balance: '$8,000' },
    ];

    const leaderboardBody = document.getElementById('leaderboard-body');
    leaderboardData.forEach(player => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${player.rank}</td>
            <td>${player.username}</td>
            <td>${player.balance}</td>
        `;
        leaderboardBody.appendChild(row);
    });

    // Handle login modal
    const loginLink = document.getElementById('login-link');
    const loginModal = document.getElementById('login-modal');
    const closeModal = document.getElementById('close-modal');

    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });

    // Handle login button
    const loginButton = document.getElementById('login');
    loginButton.addEventListener('click', () => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        console.log('Logging in with:', email, password);
        
        // Add your authentication logic here

        // Close the modal after login
        loginModal.style.display = 'none';
    });
});