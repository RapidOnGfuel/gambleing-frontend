function blackjackGame() {
    const BACK_CARD = "https://deckofcardsapi.com/static/img/back.png";
    const deckApiUrl = 'https://deckofcardsapi.com/api/deck';

    return {
        deckId: null,
        playerCards: [],
        dealerCards: [],
        playerScore: 0,
        dealerScore: 0,
        gameStarted: false,
        playerTurn: true,
        message: 'Click "Deal Cards" to start the game.',
        betAmount: 0,
        points: parseFloat(localStorage.getItem('balance')) || 1000.00,

        async startGame() {
            if (this.betAmount <= 0 || this.betAmount > this.points) {
                this.message = "Invalid bet amount.";
                return;
            }
            
            try {
                const deckResponse = await fetch(`${deckApiUrl}/new/shuffle/?deck_count=6`);
                const deckData = await deckResponse.json();
                this.deckId = deckData.deck_id;
                this.gameStarted = true;
                this.playerTurn = true;
                this.message = "Game started! Your turn.";
                this.points -= this.betAmount;
                this.updateBalance();
                await this.dealInitialCards();
            } catch (error) {
                console.error('Error starting game:', error);
                this.message = 'Error starting game. Please try again later.';
            }
        },

        async dealInitialCards() {
            try {
                this.playerCards = [];
                this.dealerCards = [];
                this.playerCards.push(await this.drawCard());
                this.dealerCards.push({ image: BACK_CARD, showback: true }); // Show back of card
                this.playerCards.push(await this.drawCard());
                this.dealerCards.push(await this.drawCard());
                this.updateScores();
            } catch (error) {
                console.error('Error dealing cards:', error);
                this.message = 'Error dealing cards. Please try again later.';
            }
        },

        async drawCard() {
            const cardResponse = await fetch(`${deckApiUrl}/${this.deckId}/draw/?count=1`);
            const cardData = await cardResponse.json();
            if (!cardData.success) throw new Error('Failed to draw card');
            return cardData.cards[0];
        },

        updateScores() {
            this.playerScore = this.calculateScore(this.playerCards);

            if (this.dealerCards[0].showback) {
                const secondCardValue = this.getCardValue(this.dealerCards[1]);
                this.dealerScore = `${secondCardValue} + ?`;
            } else {
                this.dealerScore = this.calculateScore(this.dealerCards);
            }
        },

        getCardValue(card) {
            if (['KING', 'QUEEN', 'JACK'].includes(card.value)) {
                return 10;
            } else if (card.value === 'ACE') {
                return 11; // or 1, depending on context
            } else {
                return parseInt(card.value);
            }
        },

        calculateScore(hand) {
            let lowCount = 0;
            let highCount = 0;
            let oneAce = false;

            hand.forEach(card => {
                if (card.value === 'ACE') {
                    lowCount += 1;
                    if (!oneAce) {
                        highCount += 11;
                        oneAce = true;
                    } else {
                        highCount += 1;
                    }
                } else if (['KING', 'QUEEN', 'JACK'].includes(card.value)) {
                    lowCount += 10;
                    highCount += 10;
                } else {
                    lowCount += parseInt(card.value);
                    highCount += parseInt(card.value);
                }
            });

            return highCount > 21 ? lowCount : highCount;
        },

        async hit() {
            this.playerCards.push(await this.drawCard());
            this.updateScores();
            if (this.playerScore > 21) {
                this.message = "You busted!";
                this.playerTurn = false;
                this.gameStarted = false;
            }
        },

        async stand() {
            this.playerTurn = false;
            this.message = "Dealer's turn.";
            await this.revealDealerCard();
            await this.dealerTurn();
        },

        async revealDealerCard() {
            const newCard = await this.drawCard();
            this.dealerCards[0] = newCard; // Replace the back card with a new one
            this.updateScores();
        },

        async dealerTurn() {
            while (this.dealerScore < 17) {
                this.dealerCards.push(await this.drawCard());
                this.updateScores();
            }
            this.checkOutcome();
        },

        checkOutcome() {
            if (this.dealerScore > 21) {
                this.message = "Dealer busted! You win!";
                this.points += this.betAmount * 2;
            } else if (this.dealerScore >= this.playerScore) {
                this.message = "Dealer wins!";
            } else {
                this.message = "You win!";
                this.points += this.betAmount * 2;
            }
            this.updateBalance();
            this.gameStarted = false;
        },

        updateBalance() {
            localStorage.setItem('balance', this.points.toFixed(2));
        },

        depositPoints() {
            if (this.betAmount > 0 && this.betAmount <= this.points) {
                this.message = `Deposited ${this.betAmount.toFixed(2)} points to bet.`;
            } else {
                this.message = "Invalid deposit amount.";
            }
        }
    };
}