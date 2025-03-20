const deckApiUrl = 'https://deckofcardsapi.com/api/deck';
let deckId;
let playerHand = [];
let dealerHand = [];
let playerScore = 0;
let dealerScore = 0;
let dealerHiddenCard;

// Initialize game
async function initGame() {
    try {
        const deckResponse = await fetch(`${deckApiUrl}/new/shuffle/?deck_count=6`);
        const deckData = await deckResponse.json();
        if (!deckData.success) throw new Error('Failed to shuffle deck');
        deckId = deckData.deck_id;
    } catch (error) {
        console.error('Error initializing game:', error);
        document.getElementById('message').textContent = 'Error initializing game. Please try again later.';
    }
}

// Deal initial two cards to player and dealer
async function dealInitialCards() {
    try {
        await drawCard('player', 2);
        await drawCard('dealer', 1, true);
        await drawCard('dealer', 1);
        updateScores();
        enableControls();
    } catch (error) {
        console.error('Error dealing cards:', error);
        document.getElementById('message').textContent = 'Error dealing cards. Please try again later.';
    }
}

// Draw cards for player or dealer
async function drawCard(target, count = 1, isDealerHidden = false) {
    try {
        const cardResponse = await fetch(`${deckApiUrl}/${deckId}/draw/?count=${count}`);
        const cardData = await cardResponse.json();
        if (!cardData.success) throw new Error('Failed to draw cards');
        const cards = cardData.cards;

        cards.forEach(card => {
            if (target === 'player') {
                playerHand.push(card);
                renderCard(card, 'player-cards');
            } else {
                dealerHand.push(card);
                if (isDealerHidden) {
                    dealerHiddenCard = card;
                    renderCard({ image: 'https://deckofcardsapi.com/static/img/back.png' }, 'dealer-cards');
                } else {
                    renderCard(card, 'dealer-cards');
                }
            }
        });
    } catch (error) {
        console.error('Error drawing cards:', error);
        document.getElementById('message').textContent = 'Error drawing cards. Please try again later.';
    }
}

// Render card image with fade-in effect
function renderCard(card, elementId) {
    const cardElement = document.createElement('img');
    cardElement.src = card.image;
    cardElement.classList.add('visible');
    document.getElementById(elementId).appendChild(cardElement);
}

// Calculate hand score
function calculateScore(hand) {
    let score = 0;
    let aces = 0;

    hand.forEach(card => {
        if (card.value === 'ACE') {
            aces += 1;
            score += 11;
        } else if (['KING', 'QUEEN', 'JACK'].includes(card.value)) {
            score += 10;
        } else {
            score += parseInt(card.value);
        }
    });

    while (score > 21 && aces > 0) {
        score -= 10;
        aces -= 1;
    }

    return score;
}

// Update scores
function updateScores() {
    playerScore = calculateScore(playerHand);
    dealerScore = calculateScore(dealerHand);

    document.getElementById('player-score').textContent = `Score: ${playerScore}`;
    if (dealerHiddenCard) {
        document.getElementById('dealer-score').textContent = `Score: ?`;
    } else {
        document.getElementById('dealer-score').textContent = `Score: ${dealerScore}`;
    }
}

// Enable controls after dealing cards
function enableControls() {
    document.getElementById('hit').disabled = false;
    document.getElementById('stand').disabled = false;
    document.getElementById('double').disabled = false;
    document.getElementById('fold').disabled = false;
    document.getElementById('deal').style.display = 'none';
}

// Player actions
document.getElementById('deal').addEventListener('click', async () => {
    await initGame();
    await dealInitialCards();
});

document.getElementById('hit').addEventListener('click', async () => {
    await drawCard('player');
    updateScores();
    checkOutcome();
});

document.getElementById('stand').addEventListener('click', () => {
    revealDealerCard();
    dealerTurn();
});

document.getElementById('double').addEventListener('click', async () => {
    await drawCard('player');
    updateScores();
    revealDealerCard();
    dealerTurn();
});

document.getElementById('fold').addEventListener('click', () => {
    document.getElementById('message').textContent = 'You folded!';
    disableControls();
});

// Reveal dealer's hidden card
function revealDealerCard() {
    const dealerCardsElement = document.getElementById('dealer-cards');
    dealerCardsElement.removeChild(dealerCardsElement.firstChild);
    renderCard(dealerHiddenCard, 'dealer-cards');
    dealerHiddenCard = null;
    updateScores();
}

// Dealer's turn
async function dealerTurn() {
    while (dealerScore < 17) {
        await drawCard('dealer');
        updateScores();
    }
    checkOutcome();
}

// Check outcome
function checkOutcome() {
    if (playerScore > 21) {
        document.getElementById('message').textContent = 'You busted!';
        disableControls();
    } else if (dealerScore > 21) {
        document.getElementById('message').textContent = 'Dealer busted! You win!';
        disableControls();
    } else if (playerScore === 21) {
        document.getElementById('message').textContent = 'Blackjack! You win!';
        disableControls();
    } else if (dealerScore === 21) {
        document.getElementById('message').textContent = 'Dealer has Blackjack! You lose!';
        disableControls();
    } else if (dealerScore >= 17) {
        if (playerScore > dealerScore) {
            document.getElementById('message').textContent = 'You win!';
        } else if (playerScore < dealerScore) {
            document.getElementById('message').textContent = 'You lose!';
        } else {
            document.getElementById('message').textContent = 'It\'s a tie!';
        }
        disableControls();
    }
}

// Disable controls after game ends
function disableControls() {
    document.getElementById('hit').disabled = true;
    document.getElementById('stand').disabled = true;
    document.getElementById('double').disabled = true;
    document.getElementById('fold').disabled = true;
}

// Start the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('deal').disabled = false;
});
