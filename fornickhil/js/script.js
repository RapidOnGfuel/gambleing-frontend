document.addEventListener('DOMContentLoaded', () => {
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
});