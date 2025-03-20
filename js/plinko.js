let points = localStorage.getItem('plinkoPoints') || 100;
document.getElementById('points').textContent = points;

// Symmetrical multipliers with 0.5 in the middle
const multipliers = [14, 9, 2, 1.4, 1.2, 1.1, 1, 0.5, 1, 1.1, 1.2, 1.4, 2, 9, 14];

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
        width: 600,
        height: 700,
        wireframes: false,
        background: '#f0f0f0',
        pixelRatio: window.devicePixelRatio / 2 // Lower resolution
    }
});

// Collision categories
const defaultCategory = 0x0001;
const ballCategory = 0x0002;

// Create pegs
function createPegs() {
    const pegRadius = 5;
    for (let i = 1; i < 18; i++) {
        for (let j = 0; j <= i; j++) {
            const x = 300 + (j - i / 2) * 40;
            const y = i * 40;
            const peg = Bodies.circle(x, y, pegRadius, { 
                isStatic: true, 
                friction: 0, 
                restitution: 0.9,
                collisionFilter: {
                    category: defaultCategory
                }
            });
            World.add(world, peg);
        }
    }
}

// Create slots
function createSlots() {
    const slotWidth = 40;
    for (let i = 0; i < multipliers.length; i++) {
        const x = i * slotWidth + slotWidth / 2;
        const y = 680;
        const slot = Bodies.rectangle(x, y, slotWidth, 10, { 
            isStatic: true, 
            label: 'slot',
            collisionFilter: {
                category: defaultCategory
            }
        });
        World.add(world, slot);
    }
}

// Create ball with non-colliding filter for other balls
function createBall() {
    const ball = Bodies.circle(300, 0, 10, {
        restitution: 0.9,
        collisionFilter: {
            category: ballCategory,
            mask: defaultCategory // Collide only with default category
        }
    });
    World.add(world, ball);

    Events.on(engine, 'collisionStart', (event) => {
        event.pairs.forEach((pair) => {
            if (pair.bodyB === ball && pair.bodyA.label === 'slot') {
                const slotIndex = Math.floor(pair.bodyA.position.x / 40);
                const multiplier = multipliers[slotIndex];
                points = (points * multiplier).toFixed(2);
                document.getElementById('points').textContent = points;
                localStorage.setItem('plinkoPoints', points);
                World.remove(world, ball);
            }
        });
    });

    // Remove ball if it goes out of bounds
    Events.on(engine, 'afterUpdate', () => {
        if (ball.position.y > 700) { // Check if the ball is below the board
            World.remove(world, ball);
        }
    });
}

// Start the game
function startGame(difficulty) {
    if (difficulty === 'easy') {
        createPegs();
        createSlots();
        createBall();
        Engine.run(engine);
        Render.run(render);
    }
}