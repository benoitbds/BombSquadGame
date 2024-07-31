// Variables globales
let currentScreen = 'home-screen';
let players = [];
let currentPlayerIndex = 0;
let bombPlanter = null;
let timerInterval = null;
let remainingTime = 0;
const wireColors = ['red', 'blue', 'green'];
let correctWires = [];
let selectedWires = [];
let hints = [];

// Fonctions
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
    });
    document.getElementById(screenId).style.display = 'block';
    currentScreen = screenId;
}

function showFeedback(message, isSuccess) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.className = 'feedback ' + (isSuccess ? 'success' : 'error');
    feedback.classList.add('show');
    setTimeout(() => {
        feedback.classList.remove('show');
    }, 2000);
}

function startSetup() {
    showScreen('player-setup');
}

function setPlayerCount() {
    const playerCount = parseInt(document.getElementById('player-count').value);
    if (playerCount < 3 || playerCount > 8) {
        showFeedback("Le nombre de joueurs doit être entre 3 et 8", false);
        return;
    }
    const playerInputs = document.getElementById('player-inputs');
    playerInputs.innerHTML = '';
    for (let i = 0; i < playerCount; i++) {
        playerInputs.innerHTML += `
            <input type="text" id="player-${i}" placeholder="Pseudo du Joueur ${i + 1}" required>
        `;
    }
    playerInputs.style.display = 'block';
    document.getElementById('start-game').style.display = 'block';
    document.getElementById('set-player-count').style.display = 'none';
}

function startGame() {
    setupPlayers();
    setupGame();
    showScreen('role-distribution');
}

function setupPlayers() {
    players = [];
    const playerInputs = document.getElementById('player-inputs').getElementsByTagName('input');
    for (let i = 0; i < playerInputs.length; i++) {
        const pseudo = playerInputs[i].value.trim() || `Joueur ${i + 1}`;
        players.push({id: i, name: pseudo, role: null, hint: ''});
    }
}

function setupGame() {
    bombPlanter = Math.floor(Math.random() * players.length);
    correctWires = [];
    while (correctWires.length < 2) {
        const wire = wireColors[Math.floor(Math.random() * wireColors.length)];
        if (!correctWires.includes(wire)) {
            correctWires.push(wire);
        }
    }
    generateHints();
}

function generateHints() {
    const safeWire = wireColors.find(color => !correctWires.includes(color));
    hints = players.map((player, index) => {
        if (index === bombPlanter) {
            return `Les fils à couper sont ${correctWires[0]} et ${correctWires[1]}.`;
        } else {
            const hintType = Math.random() < 0.5;
            return hintType
                ? `Le fil ${safeWire} est sûr.`
                : `Évitez le fil ${correctWires[Math.floor(Math.random() * 2)]}.`;
        }
    });
}

function showRole() {
    const player = players[currentPlayerIndex];
    player.role = currentPlayerIndex === bombPlanter ? 'Poseur de bombe' : 'Démineur';
    player.hint = hints[currentPlayerIndex];

    const roleDisplay = document.getElementById('role-display');
    const roleHint = document.getElementById('role-hint');
    roleDisplay.textContent = `${player.name}, votre rôle : ${player.role}`;
    roleHint.textContent = `Indice : ${player.hint}`;

    document.getElementById('role-info').style.display = 'block';
    document.getElementById('show-role').style.display = 'none';
    document.getElementById('next-player').style.display = 'block';
}

function nextPlayer() {
    document.getElementById('role-info').style.display = 'none';
    currentPlayerIndex++;
    if (currentPlayerIndex < players.length) {
        document.getElementById('show-role').style.display = 'block';
        document.getElementById('next-player').style.display = 'none';
    } else {
        showDiscussionPhase();
    }
}

function showDiscussionPhase() {
    showScreen('discussion-phase');
    const revealedHints = document.getElementById('revealed-hints');
    revealedHints.innerHTML = players.map(player => `<p>${player.name}: ${player.hint}</p>`).join('');
}

function startDefusing() {
    showScreen('game-screen');
    remainingTime = 300; // 5 minutes
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    document.getElementById('timer').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    if (remainingTime <= 60) {
        document.getElementById('timer').style.color = '#ff0000';
    }
    if (remainingTime <= 0) {
        clearInterval(timerInterval);
        endGame('Le temps est écoulé ! La bombe a explosé.');
    }
    remainingTime--;
}

function toggleWireSelection(button) {
    const color = button.dataset.color;
    const index = selectedWires.indexOf(color);
    if (index > -1) {
        selectedWires.splice(index, 1);
        button.classList.remove('selected');
    } else if (selectedWires.length < 2) {
        selectedWires.push(color);
        button.classList.add('selected');
    }
    document.getElementById('validate-choice').style.display = selectedWires.length === 2 ? 'block' : 'none';
}

function validateWireChoice() {
    const isCorrect = selectedWires.every(wire => correctWires.includes(wire)) && selectedWires.length === correctWires.length;
    endGame(isCorrect ? 'Félicitations ! Vous avez désamorcé la bombe !' : 'Boom ! Vous avez coupé le mauvais fil. La bombe a explosé.');
}

function endGame(message) {
    clearInterval(timerInterval);
    showFeedback(message, message.includes('Félicitations'));
    setTimeout(() => {
        showScreen('home-screen');
        resetGame();
    }, 3000);
}

function resetGame() {
    currentPlayerIndex = 0;
    bombPlanter = null;
    selectedWires = [];
    document.querySelectorAll('.wire-button').forEach(button => button.classList.remove('selected'));
}

// Event listeners
document.getElementById('start-setup').addEventListener('click', startSetup);
document.getElementById('set-player-count').addEventListener('click', setPlayerCount);
document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('show-role').addEventListener('click', showRole);
document.getElementById('next-player').addEventListener('click', nextPlayer);
document.getElementById('start-defusing').addEventListener('click', startDefusing);
document.querySelectorAll('.wire-button').forEach(button => {
    button.addEventListener('click', () => toggleWireSelection(button));
});
document.getElementById('validate-choice').addEventListener('click', validateWireChoice);

// Initialisation
showScreen('home-screen');
