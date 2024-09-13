// Variables globales
let players = [];
let roles = {};
let currentPlayerIndex = 0;
let gameActive = true;
let timeRemaining = 60; // Temps initial en secondes
let timerInterval;
let correctWire;
let selectedWireColor;

// Éléments du DOM
const welcomeScreen = document.getElementById('welcome-screen');
const playerSetupScreen = document.getElementById('player-setup-screen');
const roleRevealScreen = document.getElementById('role-reveal-screen');
const gameScreen = document.getElementById('game-screen');

const startGameBtn = document.getElementById('start-game-btn');
const addPlayerBtn = document.getElementById('add-player-btn');
const startAssignmentBtn = document.getElementById('start-assignment-btn');
const nextPlayerBtn = document.getElementById('next-player-btn');
const restartGameBtn = document.getElementById('restart-game-btn');

const playerNameInput = document.getElementById('player-name-input');
const playerList = document.getElementById('player-list');
const currentPlayerName = document.getElementById('current-player-name');
const roleInfo = document.getElementById('role-info');
const wiresContainer = document.getElementById('wires-container');

const timerDisplay = document.getElementById('time-remaining');
const miniGameScreen = document.getElementById('mini-game-screen');
const slider = document.getElementById('slider');
const targetZone = document.getElementById('target-zone');
const cutWireBtn = document.getElementById('cut-wire-btn');


// Écran d'accueil
startGameBtn.addEventListener('click', () => {
    welcomeScreen.style.display = 'none';
    playerSetupScreen.style.display = 'block';
});

// Ajout des joueurs
addPlayerBtn.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if (name !== '') {
        players.push(name);
        const li = document.createElement('li');
        li.textContent = name;
        playerList.appendChild(li);
        playerNameInput.value = '';
        if (players.length >= 3) {
            startAssignmentBtn.style.display = 'inline-block';
        }
    }
});

// Attribuer les rôles
startAssignmentBtn.addEventListener('click', () => {
    playerSetupScreen.style.display = 'none';
    assignRoles();
    currentPlayerIndex = 0;
    showRoleRevealScreen();
});

// Révéler les rôles
nextPlayerBtn.addEventListener('click', () => {
    currentPlayerIndex++;
    if (currentPlayerIndex < players.length) {
        showRoleRevealScreen();
    } else {
        roleRevealScreen.style.display = 'none';
        startGame();
    }
});

// Rejouer
restartGameBtn.addEventListener('click', () => {
    location.reload();
});

// Attribuer les rôles aléatoirement
function assignRoles() {
    // Initialiser les rôles
    roles = {};
    const totalPlayers = players.length;
    const numBombers = Math.floor(totalPlayers / 3); // Environ un poseur de bombe pour 3 joueurs

    // Mélanger les index des joueurs
    const shuffledIndices = players.map((_, index) => index).sort(() => Math.random() - 0.5);

    // Attribuer les rôles de poseur de bombe
    for (let i = 0; i < numBombers; i++) {
        roles[players[shuffledIndices[i]]] = 'Poseur de Bombe';
    }

    // Attribuer les rôles de démineur aux autres
    for (let i = numBombers; i < totalPlayers; i++) {
        roles[players[shuffledIndices[i]]] = 'Démineur';
    }
}

// Afficher l'écran de révélation des rôles
function showRoleRevealScreen() {
    roleRevealScreen.style.display = 'block';
    currentPlayerName.textContent = `Au tour de ${players[currentPlayerIndex]} de découvrir son rôle`;
    roleInfo.textContent = 'Appuyez pour voir votre rôle';
    nextPlayerBtn.textContent = 'Voir le Rôle';

    nextPlayerBtn.onclick = () => {
        const playerName = players[currentPlayerIndex];
        const playerRole = roles[playerName];
        roleInfo.textContent = `Votre rôle : ${playerRole}`;
        if (playerRole === 'Démineur') {
            roleInfo.textContent += '\nIndice : Le bon fil n\'est pas rouge.';
        } else {
            roleInfo.textContent += '\nVous connaissez la combinaison exacte.';
        }
        nextPlayerBtn.textContent = 'Passer au Suivant';
        nextPlayerBtn.onclick = () => {
            currentPlayerIndex++;
            if (currentPlayerIndex < players.length) {
                showRoleRevealScreen();
            } else {
                roleRevealScreen.style.display = 'none';
                startGame();
            }
        };
    };
}

// Commencer le jeu
function startGame() {
    gameScreen.style.display = 'block';
    generateWires();
    startTimer();
}

// Démarrer le compte à rebours
function startTimer() {
    timerDisplay.textContent = timeRemaining;
    timerInterval = setInterval(() => {
        timeRemaining--;
        timerDisplay.textContent = timeRemaining;
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            gameActive = false;
            alert('BOUM ! La bombe a explosé.');
            restartGameBtn.style.display = 'inline-block';
        }
    }, 1000);
}

// Générer les fils à couper avec indices complexes
function generateWires() {
    const wireColors = ['red', 'blue', 'green', 'yellow'];
    correctWire = wireColors[Math.floor(Math.random() * wireColors.length)];

    wireColors.forEach(color => {
        const wire = document.createElement('div');
        wire.classList.add('wire', color);
        wire.addEventListener('click', () => {
            if (!gameActive) return;
            selectedWireColor = color;
            gameScreen.style.display = 'none';
            startMiniGame();
        });
        wiresContainer.appendChild(wire);
    });
}

// Commencer le mini-jeu pour couper le fil
function startMiniGame() {
    miniGameScreen.style.display = 'block';
    moveSlider();
}

// Logique du mini-jeu
let sliderInterval;
let sliderDirection = 1;

function moveSlider() {
    let position = 0;
    sliderInterval = setInterval(() => {
        if (position >= 290) sliderDirection = -1;
        if (position <= 0) sliderDirection = 1;
        position += sliderDirection * 5;
        slider.style.left = position + 'px';
    }, 30);
}

cutWireBtn.addEventListener('click', () => {
    clearInterval(sliderInterval);
    const sliderPos = slider.getBoundingClientRect();
    const targetPos = targetZone.getBoundingClientRect();

    if (
        sliderPos.left >= targetPos.left &&
        sliderPos.right <= targetPos.right
    ) {
        // Succès du mini-jeu
        checkWire();
    } else {
        // Échec du mini-jeu
        gameActive = false;
        miniGameScreen.style.display = 'none';
        alert('Vous avez manqué le fil ! BOUM !');
        clearInterval(timerInterval);
        restartGameBtn.style.display = 'inline-block';
    }
});

function checkWire() {
    miniGameScreen.style.display = 'none';
    if (selectedWireColor === correctWire) {
        alert('Bravo ! Vous avez désamorcé la bombe.');
    } else {
        alert('BOUM ! La bombe a explosé.');
    }
    gameActive = false;
    clearInterval(timerInterval);
    restartGameBtn.style.display = 'inline-block';
}
