// Variables globales
let currentScreen = 'home-screen';
let players = [];
let currentPlayerIndex = 0;
let bombPlanter = null;
let timerInterval = null;
let remainingTime = 0;
const wireColors = ['red', 'blue', 'green', 'yellow'];
let correctWire = '';
let selectedWire = null;
let turnCount = 0;
const clues = [
    "Le fil correct a une couleur chaude.",
    "Le fil correct n'est pas un de ceux aux extrémités.",
    "Le fil correct est adjacent à un fil bleu.",
    "Le fil correct a une lettre en commun avec le mot 'vert'.",
];

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
    showScreen('role-distribution');
}

function setupPlayers() {
    players = [];
    const playerInputs = document.getElementById('player-inputs').getElementsByTagName('input');
    for (let i = 0; i < playerInputs.length; i++) {
        const pseudo = playerInputs[i].value.trim() || `Joueur ${i + 1}`;
        players.push({id: i, name: pseudo, role: null});
    }
}

function distributeRoles() {
    if (!bombPlanter) {
        bombPlanter = Math.floor(Math.random() * players.length);
    }
    const role = currentPlayerIndex === bombPlanter ? 'Poseur de bombe' : 'Démineur';
    players[currentPlayerIndex].role = role;
    return role;
}

function showRole() {
    const role = distributeRoles();
    const roleDisplay = document.getElementById('role-display');
    roleDisplay.textContent = `${players[currentPlayerIndex].name}, votre rôle : ${role}`;
    roleDisplay.style.display = 'block';
    document.getElementById('show-role').style.display = 'none';
    document.getElementById('next-player').style.display = 'block';
    showFeedback("Rôle attribué!", true);
}

function nextPlayer() {
    currentPlayerIndex++;
    if (currentPlayerIndex < players.length) {
        document.getElementById('role-display').style.display = 'none';
        document.getElementById('show-role').style.display = 'block';
        document.getElementById('next-player').style.display = 'none';
    } else {
        showFeedback("Tous les rôles ont été distribués!", true);
        setTimeout(() => {
            startGameplay();
        }, 2000);
    }
}

function startGameplay() {
    showScreen('game-screen');
    correctWire = wireColors[Math.floor(Math.random() * wireColors.length)];
    remainingTime = 120 //Math.floor(Math.random() * (600 - 300 + 1)) + 300; // 5 à 10 minutes
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
    showClue();
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

function showClue() {
    const clueElement = document.getElementById('clue');
    clueElement.textContent = clues[turnCount % clues.length];
}

function selectWire(wire) {
    if (selectedWire) {
        selectedWire.style.transform = 'scale(1)';
    }
    selectedWire = wire;
    wire.style.transform = 'scale(1.1)';
    document.getElementById('validate-choice').style.display = 'block';
}

function validateWireChoice() {
    if (selectedWire) {
        if (selectedWire.dataset.color === correctWire) {
            endGame('Félicitations ! Vous avez désamorcé la bombe !');
        } else {
            endGame('Boom ! Vous avez coupé le mauvais fil. La bombe a explosé.');
        }
    }
}

function endGame(message) {
    clearInterval(timerInterval);
    showFeedback(message, message.includes('Félicitations'));
    setTimeout(() => {
        showScreen('home-screen');
    }, 3000);
}

// Event listeners
document.getElementById('start-setup').addEventListener('click', startSetup);
document.getElementById('set-player-count').addEventListener('click', setPlayerCount);
document.getElementById('start-game').addEventListener('click', startGame);
document.getElementById('show-role').addEventListener('click', showRole);
document.getElementById('next-player').addEventListener('click', nextPlayer);
document.getElementById('wire-container').addEventListener('click', (e) => {
    if (e.target.classList.contains('wire')) {
        selectWire(e.target);
    }
});
document.getElementById('validate-choice').addEventListener('click', validateWireChoice);

// Initialisation
showScreen('home-screen');
