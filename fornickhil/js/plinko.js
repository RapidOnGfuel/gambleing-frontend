let points = localStorage.getItem('plinkoPoints') || 100;
document.getElementById('points').textContent = points;

// Symmetrical multipliers with 0.5 in the middle
const multipliers = [14, 9, 2, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 2, 9, 14];

function startGame(difficulty) {
    if (difficulty === 'easy') {
        createBoard();
    }
}

function createBoard() {
    const board = document.getElementById('plinko-board');
    board.innerHTML = ''; // Clear board

    // Create 18 rows of pegs, starting from the second row
    for (let i = 1; i < 18; i++) {
        const row = document.createElement('div');
        row.className = 'plinko-row';
        
        for (let j = 0; j <= i; j++) {
            const peg = document.createElement('div');
            peg.className = 'plinko-peg';
            row.appendChild(peg);
        }
        
        board.appendChild(row);
    }

    // Create slots for multipliers
    const slotRow = document.createElement('div');
    slotRow.className = 'plinko-row';
    multipliers.forEach((multiplier) => {
        const slot = document.createElement('div');
        slot.className = 'plinko-slot';
        slot.textContent = multiplier;
        slotRow.appendChild(slot);
    });
    board.appendChild(slotRow);
}

function playPlinko() {
    animateBall();
}

function animateBall() {
    const board = document.getElementById('plinko-board');
    const ball = document.createElement('div');
    ball.className = 'plinko-ball';
    board.appendChild(ball);

    let velocityY = 1;
    let velocityX = 0;
    let positionY = 0;
    let positionX = board.offsetWidth / 2;

    function updateBall() {
        velocityY += 0.1; // Simulate gravity
        positionY += velocityY;
        positionX += velocityX;

        // Check for collisions with pegs
        const rows = board.querySelectorAll('.plinko-row');
        rows.forEach((row) => {
            if (positionY >= row.offsetTop && positionY < row.offsetTop + 10) {
                const pegs = row.children;
                for (let i = 0; i < pegs.length; i++) {
                    const peg = pegs[i];
                    if (Math.abs(positionX - peg.offsetLeft) < 15) {
                        // Reflect velocityX and reduce it
                        velocityX = (Math.random() < 0.5 ? -1 : 1) * Math.abs(velocityX) * 0.85;
                        break;
                    }
                }
            }
        });

        // Constrain the ball within the board
        positionX = Math.max(0, Math.min(positionX, board.offsetWidth - 15));

        ball.style.top = `${positionY}px`;
        ball.style.left = `${positionX}px`;

        // Check if the ball has reached the bottom
        if (positionY >= board.offsetHeight - 50) {
            clearInterval(interval);
            const slotIndex = Math.floor(positionX / (board.offsetWidth / multipliers.length));
            const multiplier = multipliers[slotIndex];
            points = (points * multiplier).toFixed(2);
            document.getElementById('points').textContent = points;
            localStorage.setItem('plinkoPoints', points);
            board.removeChild(ball);
        }
    }

    const interval = setInterval(updateBall, 30);
}