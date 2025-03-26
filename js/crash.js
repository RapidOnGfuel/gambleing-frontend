let balance = parseFloat(localStorage.getItem('balance')) || 1000.00;
let betAmount = 0;
let multiplier = 1.0;
let isCrashed = false;
let cooldown = 15 * 60 * 1000; // 15 minutes in milliseconds
let lastCooldownTime = 0;
let cooldownInterval = null;
const maxMultiplier = 10.0; // Set your desired maximum multiplier

const multiplierDisplay = document.getElementById('multiplier-display');
const crashMessage = document.getElementById('crash-message');
const balanceDisplay = document.getElementById('balance-display');
const betInput = document.getElementById('bet-input');
const autoCashoutInput = document.getElementById('auto-cashout-input');
const startButton = document.getElementById('start-button');
const cashoutButton = document.getElementById('cashout-button');
const poorButton = document.getElementById('poor-button');
const rocketAnimation = document.getElementById('rocket-animation');
const resetButton = document.getElementById('reset-button');

function updateBalanceDisplay() {
    balanceDisplay.textContent = 'Balance: ' + balance.toFixed(2);
}

function startGame() {
    betAmount = parseFloat(betInput.value);
    if (betAmount > 0 && betAmount <= balance) {
        balance -= betAmount;
        updateBalanceDisplay();
        localStorage.setItem('balance', balance);
        multiplier = 1.0;
        isCrashed = false;
        crashMessage.style.display = 'none';
        rocketAnimation.style.backgroundImage = "url('/images/rfly.png')";
        rocketAnimation.style.animationPlayState = 'running';
        cashoutButton.disabled = false;
        startButton.disabled = true; // Disable start button
        updateMultiplier();
    } else {
        alert("Invalid bet amount!");
    }
}

function updateMultiplier() {
    if (isCrashed) return;

    multiplier += 0.01;
    multiplierDisplay.textContent = multiplier.toFixed(2) + 'x';

    const autoCashoutValue = parseFloat(autoCashoutInput.value);
    if (autoCashoutValue && multiplier >= autoCashoutValue) {
        cashOut();
    }

    if (multiplier >= maxMultiplier || Math.random() < 0.01) { // Cap or crash
        isCrashed = true;
        rocketAnimation.style.animationPlayState = 'paused';
        rocketAnimation.style.backgroundImage = "url('/images/rcrash.png')";
        crashMessage.style.display = 'block';
        cashoutButton.disabled = true;
        startButton.disabled = false; // Re-enable start button
    } else {
        setTimeout(updateMultiplier, 50); // Update every 50ms
    }
}

function cashOut() {
    if (!isCrashed) {
        balance += betAmount * multiplier;
        updateBalanceDisplay();
        localStorage.setItem('balance', balance);
        isCrashed = true;
        rocketAnimation.style.animationPlayState = 'paused';
        rocketAnimation.style.backgroundImage = "url('/images/rcrash.png')";
        cashoutButton.disabled = true;
        startButton.disabled = false; // Re-enable start button
    }
}

startButton.addEventListener('click', startGame);

cashoutButton.addEventListener('click', cashOut);

poorButton.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastCooldownTime >= cooldown) {
        balance += 1000;
        updateBalanceDisplay();
        localStorage.setItem('balance', balance);
        lastCooldownTime = now;
        poorButton.disabled = true;
        startCooldownTimer();
    }
});

resetButton.addEventListener('click', () => {
    balance = 1000.00;
    updateBalanceDisplay();
    localStorage.setItem('balance', balance);
    betInput.value = '';
    autoCashoutInput.value = '';
    multiplier = 1.0;
    multiplierDisplay.textContent = '1.00x';
    isCrashed = false;
    cashoutButton.disabled = true;
    startButton.disabled = false;
    poorButton.disabled = false;
    poorButton.textContent = "I'm Poor";
    lastCooldownTime = 0;
    if (cooldownInterval) {
        clearInterval(cooldownInterval);
        cooldownInterval = null;
    }
    rocketAnimation.style.backgroundImage = "url('/images/rfly.png')";
    rocketAnimation.style.animationPlayState = 'running';
    crashMessage.style.display = 'none';
});

function startCooldownTimer() {
    cooldownInterval = setInterval(() => {
        const remainingTime = cooldown - (Date.now() - lastCooldownTime);
        if (remainingTime <= 0) {
            clearInterval(cooldownInterval);
            cooldownInterval = null;
            poorButton.disabled = false;
            poorButton.textContent = "I'm Poor";
        } else {
            const minutes = Math.floor(remainingTime / 60000);
            const seconds = Math.floor((remainingTime % 60000) / 1000);
            poorButton.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    }, 1000);
}

// Initialize balance display on page load
updateBalanceDisplay();