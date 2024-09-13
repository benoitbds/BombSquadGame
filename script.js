// Variables globales
let players = [];
let roles = {};
let playerClues = {};
let currentPlayerIndex = 0;
let gameActive = true;
let codeToDefuse = '';
let timeLeft = 60; // Temps en secondes pour désamorcer la bombe
let timerInterval;

// Éléments du DOM
const welcomeScreen = document.getElementById('welcome-screen');
const playerSetupScreen = document.getElementById('player-setup-screen');
const roleRevealScreen = document.getElementById('role-reveal-screen');
const codeEntryScreen = document.getElementById('code-entry-screen');
const voteScreen = document.getElementById('vote-screen');
const endScreen = document.getElementById('end-screen');

const startGameBtn = document.getElementById('start-game-btn');
const addPlayerBtn = document.getElementById('add-player-btn');
const startAssignmentBtn = document.getElementById('start-assignment-btn');
const nextPlayerBtn = document.getElementById('next-player-btn');
const submitCodeBtn = document.getElementById('submit-code-btn');
const callVoteBtn = document.getElementById('call-vote-btn');
const submitVoteBtn = document.getElementById('submit-vote-btn');
const restartGameBtn = document.getElementById('restart-game-btn');

const playerNameInput = document.getElementById('player-name-input');
const playerList = document.getElementById('player-list');
const currentPlayerName = document.getElementById('current-player-name');
const roleInfo = document.getElementById('role-info');
const codeInput = document.getElementById('code-input');
const timerDisplay = document.getElementById('time-left');
const votePlayerList = document.getElementById('vote-player-list');
const endMessage = document.getElementById('end-message');

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
    if (players.length >= 3) {
        playerSetupScreen.style.display = 'none';
        assignRoles();
        currentPlayerIndex = 0;
        showRoleRevealScreen();
    } else {
        alert('Il faut au moins 3 joueurs pour commencer le jeu.');
    }
});

// Révéler les rôles
function showRoleRevealScreen() {
    roleRevealScreen.style.display = 'block';
    currentPlayerName.textContent = `Au tour de ${players[currentPlayerIndex]} de découvrir son rôle`;
    roleInfo.textContent = 'Appuyez pour voir votre rôle';
    nextPlayerBtn.textContent = 'Voir le Rôle';

    nextPlayerBtn.onclick = () => {
        const playerName = players[currentPlayerIndex];
        const playerRole = roles[playerName];
        const playerClue = playerClues[playerName];
        roleInfo.textContent = `Votre rôle : ${playerRole}\n\n${playerClue}`;
        nextPlayerBtn.textContent = 'Passer au Suivant';
        nextPlayerBtn.onclick = () => {
            currentPlayerIndex++;
            if (currentPlayerIndex < players.length) {
                roleInfo.textContent = '';
                showRoleRevealScreen();
            } else {
                roleRevealScreen.style.display = 'none';
                startGame();
            }
        };
    };
}

// Attribuer les rôles et les indices
function assignRoles() {
    // Initialiser les rôles
    roles = {};
    const totalPlayers = players.length;
    const numBombers = Math.max(1, Math.floor(totalPlayers / 3)); // Au moins un poseur de bombe

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

    // Générer le code à désamorcer (par exemple, un code à 4 chiffres)
    codeToDefuse = '';
    for (let i = 0; i < 4; i++) {
        codeToDefuse += Math.floor(Math.random() * 10);
    }

    // Distribuer les indices aux joueurs
    playerClues = {};
    let positions = [0, 1, 2, 3];
    positions = positions.sort(() => Math.random() - 0.5);

    players.forEach(player => {
        if (roles[player] === 'Démineur') {
            // Chaque Démineur connaît une position du code
            const position = positions.pop();
            const digit = codeToDefuse[position];
            playerClues[player] = `Le chiffre en position ${position + 1} est ${digit}.`;
        } else {
            // Les Poseurs de Bombe connaissent le code complet
            playerClues[player] = `Le code est ${codeToDefuse}.`;
        }
    });
}

// Commencer le jeu
function startGame() {
    codeEntryScreen.style.display = 'block';
    startTimer();
}

// Gestion du Timer
function startTimer() {
    timerDisplay.textContent = timeLeft;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            gameOver(false);
        }
    }, 1000);
}

// Valider le code entré
submitCodeBtn.addEventListener('click', () => {
    const enteredCode = codeInput.value;
    if (enteredCode === codeToDefuse) {
        clearInterval(timerInterval);
        gameOver(true);
    } else {
        alert('Mauvais code ! Dépêchez-vous, le temps presse.');
        // Optionnel : Réduire le temps restant en cas d'erreur
        timeLeft -= 5;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            gameOver(false);
        }
    }
});

// Appeler un vote
callVoteBtn.addEventListener('click', () => {
    codeEntryScreen.style.display = 'none';
    voteScreen.style.display = 'block';
    populateVoteList();
});

// Peupler la liste de vote
function populateVoteList() {
    votePlayerList.innerHTML = '';
    players.forEach(player => {
        const li = document.createElement('li');
        li.textContent = player;
        li.addEventListener('click', () => {
            const selected = document.querySelector('#vote-player-list li.selected');
            if (selected) selected.classList.remove('selected');
            li.classList.add('selected');
        });
        votePlayerList.appendChild(li);
    });
}

// Valider le vote
submitVoteBtn.addEventListener('click', () => {
    const selected = document.querySelector('#vote-player-list li.selected');
    if (selected) {
        const accusedPlayer = selected.textContent;
        if (roles[accusedPlayer] === 'Poseur de Bombe') {
            alert(`${accusedPlayer} était un Poseur de Bombe ! Vous gagnez 15 secondes supplémentaires.`);
            timeLeft += 15;
            // Retirer le Poseur de Bombe du jeu
            players = players.filter(player => player !== accusedPlayer);
            delete roles[accusedPlayer];
            delete playerClues[accusedPlayer];
        } else {
            alert(`${accusedPlayer} était innocent. Vous perdez 10 secondes.`);
            timeLeft -= 10;
        }
        voteScreen.style.display = 'none';
        codeEntryScreen.style.display = 'block';
    } else {
        alert('Veuillez sélectionner un joueur à accuser.');
    }
});

// Rejouer
restartGameBtn.addEventListener('click', () => {
    location.reload();
});

// Fin du jeu
function gameOver(success) {
    clearInterval(timerInterval);
    codeEntryScreen.style.display = 'none';
    endScreen.style.display = 'block';
    if (success) {
        endMessage.textContent = 'Bravo ! Vous avez désamorcé la bombe.';
    } else {
        endMessage.textContent = 'BOUM ! La bombe a explosé.';
    }
    gameActive = false;
}
