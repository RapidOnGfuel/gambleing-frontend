let points = parseFloat(localStorage.getItem('balance')) || 1000.00;
document.getElementById('points').textContent = points.toFixed(2);

let depositedPoints = 0;
let autodropActive = false;
let autodropInterval;

// Updated multipliers without 14
// Updated multipliers without 0.75 and with 2 added after 1.5, to balance further
const multipliers = [9, 4, 2, 1.5, 1, 0.5, 1, 1.5, 2, 4, 9];
let ballDistribution = Array(multipliers.length).fill(0);

// Matter.js module aliases
const { Engine, Render, World, Bodies, Events } = Matter;

// Create engine and world
const engine = Engine.create();
const world = engine.world;

// Create renderer
const render = Render.create({
    element: document.getElementById('plinko-board'),
    engine: engine,
    options: {
        width: 500,
        height: 600,
        wireframes: false,
        background: '#f0f0f0',
        pixelRatio: window.devicePixelRatio / 2
    }
});

// Collision categories
const defaultCategory = 0x0001;
const ballCategory = 0x0002;

// Handle depositing points
function depositPoints() {
    const depositInput = document.getElementById('deposit-amount');
    const depositValue = parseFloat(depositInput.value);

    if (depositValue > 0 && depositValue <= points) {
        depositedPoints = depositValue;
        points -= depositValue;
        document.getElementById('points').textContent = points.toFixed(2);
        localStorage.setItem('balance', points.toFixed(2)); // Update balance in localStorage
        depositInput.value = ''; // Clear input after deposit
    } else {
        alert("Invalid deposit amount. Ensure it is within your balance.");
    }
}

// Create pegs with increased spacing
function createPegs() {
    const pegRadius = 5;
    const horizontalSpacing = 45;  // spacing between balls x value
    const verticalSpacing = 30; // spacing between balls y value
    for (let i = 1; i < 11; i++) {
        for (let j = 0; j <= i; j++) {
            const x = 250 + (j - i / 2) * horizontalSpacing;
            const y = i * verticalSpacing;
            const pegOptions = {
                isStatic: true,
                friction: 10, // self explanatory
                restitution: 0.2, // rebound speed percentage reduce
                collisionFilter: {
                    category: defaultCategory
                }
            };
            const peg = Bodies.circle(x, y, pegRadius, pegOptions);
            World.add(world, peg);
        }
    }
}

// Create slots with an 80px gap from the last row of pegs
function createSlots() {
    const slotWidth = 500 / multipliers.length;
    const slotHeight = 10;
    const bottomGap = 5; // Gap from the bottom of the bounding box
    const slotY = 410 - slotHeight - bottomGap; // Position slots within the plinko-board height

    for (let i = 0; i < multipliers.length; i++) {
        const x = i * slotWidth + slotWidth / 2;
        const slot = Bodies.rectangle(x, slotY, slotWidth, slotHeight, { 
            isStatic: true, 
            label: 'slot',
            collisionFilter: {
                category: defaultCategory
            },
            render: {
                fillStyle: '#000', // Ensure the slot is visible
            }
        });
        World.add(world, slot);

        // Add text for multipliers
        const text = document.createElement('div');
        text.style.position = 'absolute';
        text.style.left = `${x - slotWidth / 2}px`;
        text.style.top = `${slotY + 5}px`; // Adjusted to ensure visibility above the slot
        text.style.width = `${slotWidth}px`;
        text.style.textAlign = 'center';
        text.style.color = 'black';
        text.style.fontWeight = 'bold';
        text.textContent = multipliers[i];
        document.getElementById('plinko-board').appendChild(text);
    }
}

// Create ball with non-colliding filter for other balls
function createBall() {
    const startX = 250 + (Math.random() - 0.5) * 10;

    const ball = Bodies.circle(startX, 0, 6, {
        restitution: 0.9,
        collisionFilter: {
            category: ballCategory,
            mask: defaultCategory
        }
    });
    World.add(world, ball);

    // Reduce velocity during collision
    Events.on(engine, 'collisionStart', (event) => {
        event.pairs.forEach((pair) => {
            if (pair.bodyB === ball) {
                // Reduce velocity to 70% of its current speed
                const reducedVelocity = {
                    x: ball.velocity.x * 0.7, // set ball velocity to 0.7 of what it was on collision
                    y: ball.velocity.y * 0.7
                };
                Matter.Body.setVelocity(ball, reducedVelocity);
            }

            if (pair.bodyB === ball && pair.bodyA.label === 'slot') {
                const slotIndex = Math.floor(pair.bodyA.position.x / (500 / multipliers.length));
                const multiplier = multipliers[slotIndex];
                const winnings = (depositedPoints * multiplier).toFixed(2);
                points += parseFloat(winnings);
                document.getElementById('points').textContent = points.toFixed(2);
                localStorage.setItem('balance', points.toFixed(2)); // Update balance in localStorage
                World.remove(world, ball);

                // Update ball distribution
                ballDistribution[slotIndex]++;
                updateChart();
            }
        });
    });

    Events.on(engine, 'afterUpdate', () => {
        if (ball.position.y > 600) {
            World.remove(world, ball);
        }
    });
}

let engineStarted = false;

// Start the game setup
function startGame(difficulty) {
    if (difficulty === 'easy') {
        createPegs();
        createSlots();
    }
}

// Play the game
function playPlinko() {
    if (depositedPoints > 0 && depositedPoints <= points) {
        points -= depositedPoints; // Deduct the deposit amount each time
        document.getElementById('points').textContent = points.toFixed(2);
        localStorage.setItem('balance', points.toFixed(2)); // Update balance in localStorage
        createBall();
        if (!engineStarted) {
            Engine.run(engine);
            Render.run(render);
            engineStarted = true;
        }
    } else {
        alert("Not enough funds deposited to play.");
    }
}

// Toggle Developer Mode
function toggleDeveloperMode() {
    const devMode = document.getElementById('developer-mode');
    devMode.style.display = devMode.style.display === 'none' ? 'block' : 'none';
}

// Initialize Chart
let chart;
function initializeChart() {
    const ctx = document.getElementById('ballDistributionChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: multipliers,
            datasets: [{
                label: 'Ball Distribution',
                data: ballDistribution,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Multiplier'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Balls'
                    }
                }
            }
        }
    });
}

// Update Chart
function updateChart() {
    chart.data.datasets[0].data = ballDistribution;
    chart.update();
}

// Toggle Autodrop
function toggleAutodrop() {
    autodropActive = !autodropActive;
    const button = document.getElementById('autodrop-button');
    button.textContent = autodropActive ? 'Stop Autodrop' : 'Autodrop';

    if (autodropActive) {
        autodropInterval = setInterval(() => {
            if (depositedPoints > 0 && depositedPoints <= points) {
                playPlinko();
            } else {
                clearInterval(autodropInterval);
                autodropActive = false;
                button.textContent = 'Autodrop';
                alert("Not enough funds deposited to continue autodrop.");
            }
        }, 100); // Drop a ball every second
    } else {
        clearInterval(autodropInterval);
    }
}

// Initialize the chart when the page loads
window.onload = function() {
    initializeChart();
};