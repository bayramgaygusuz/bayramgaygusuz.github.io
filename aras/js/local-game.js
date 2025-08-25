// Local Game Management
// Created by: Aras Gaygusuz - ArsanaGames

// Game Settings Management
function setupGameSettings() {
    // Question count selector
    document.querySelectorAll('#settings-screen .count-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            soundSystem?.playClickSound();
            
            // Remove selected from all buttons
            document.querySelectorAll('#settings-screen .count-btn').forEach(b => 
                b.classList.remove('selected'));
            
            // Add selected to clicked button
            btn.classList.add('selected');
            
            // Update game state
            gameState.questionCount = parseInt(btn.dataset.count);
            console.log(`📊 Question count set to: ${gameState.questionCount}`);
        });
    });
}

// Player Count Management
function changePlayerCount(delta) {
    soundSystem?.playClickSound();
    
    const currentCount = gameState.players.length;
    const newCount = currentCount + delta;
    
    if (newCount < GAME_CONFIG.MIN_PLAYERS || newCount > GAME_CONFIG.MAX_PLAYERS) {
        return;
    }
    
    if (delta > 0) {
        gameState.addPlayer();
    } else {
        gameState.removePlayer();
    }
    
    // Update display
    document.getElementById('player-count-display').textContent = gameState.players.length;
    
    console.log(`👥 Player count: ${gameState.players.length}`);
}

// Player Setup Management
function setupPlayerCards() {
    const playersGrid = document.getElementById('players-grid');
    playersGrid.innerHTML = '';
    
    gameState.players.forEach((player, index) => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        
        playerCard.innerHTML = `
            ${index >= GAME_CONFIG.MIN_PLAYERS ? 
                `<button class="remove-player" onclick="removePlayer(${index})">×</button>` : ''}
            
            <h4>🎯 ${index + 1}. Oyuncu</h4>
            
            <input type="text" 
                   class="player-input" 
                   id="player${index}-name" 
                   placeholder="İsim gir..." 
                   maxlength="20"
                   value="${player.name}">
            
            <div class="character-grid">
                ${GAME_CONFIG.AVAILABLE_CHARACTERS.map(char => `
                    <div class="character-option ${char === player.character ? 'selected' : ''}" 
                         onclick="selectCharacter(${index}, '${char}')">${char}</div>
                `).join('')}
            </div>
            
            <p style="font-size: 0.8rem; opacity: 0.7; margin-top: 10px; text-align: center;">
                Karakter ve isim seç
            </p>
        `;
        
        playersGrid.appendChild(playerCard);
    });
    
    // Add event listeners to name inputs
    gameState.players.forEach((_, index) => {
        const nameInput = document.getElementById(`player${index}-name`);
        if (nameInput) {
            nameInput.addEventListener('input', utils.debounce(() => {
                validateAndUpdatePlayerName(nameInput, index);
                updateStartButton();
            }, 300));
            
            nameInput.addEventListener('blur', () => {
                validateAndUpdatePlayerName(nameInput, index);
                updateStartButton();
            });
        }
    });
    
    updateStartButton();
}

function validateAndUpdatePlayerName(input, playerIndex) {
    const isValid = utils.validateInput(input, 'name');
    
    if (isValid) {
        gameState.players[playerIndex].name = input.value.trim();
    }
    
    return isValid;
}

function selectCharacter(playerIndex, character) {
    soundSystem?.playClickSound();
    
    // Check if character is already taken by another player
    const isTaken = gameState.players.some((player, index) => 
        player.character === character && index !== playerIndex
    );
    
    if (isTaken) {
        utils.showToast('❌ Bu karakter zaten seçilmiş!');
        return;
    }
    
    // Update game state
    gameState.players[playerIndex].character = character;
    
    // Update UI
    const playerCard = document.querySelector(`#players-grid .player-card:nth-child(${playerIndex + 1})`);
    if (playerCard) {
        // Remove selected class from all options in this card
        playerCard.querySelectorAll('.character-option').forEach(option => {
            option.classList.remove('selected');
        });
        
        // Add selected class to clicked option
        const clickedOption = playerCard.querySelector(`[onclick*="'${character}'"]`);
        if (clickedOption) {
            clickedOption.classList.add('selected');
        }
    }
    
    console.log(`🎭 Player ${playerIndex + 1} selected character: ${character}`);
}

function removePlayer(index) {
    soundSystem?.playClickSound();
    
    if (gameState.players.length <= GAME_CONFIG.MIN_PLAYERS) {
        utils.showToast(`❌ En az ${GAME_CONFIG.MIN_PLAYERS} oyuncu gerekli!`);
        return;
    }
    
    gameState.players.splice(index, 1);
    setupPlayerCards();
    
    console.log(`👤 Player ${index + 1} removed`);
}

function updateStartButton() {
    const startBtn = document.getElementById('start-btn');
    if (!startBtn) return;
    
    let canStart = true;
    let errorMessage = '';
    
    // Check if all players have valid names
    for (let i = 0; i < gameState.players.length; i++) {
        const nameInput = document.getElementById(`player${i}-name`);
        if (!nameInput || !utils.validateInput(nameInput, 'name')) {
            canStart = false;
            errorMessage = 'Tüm oyuncular geçerli isim girmelidir';
            break;
        }
    }
    
    // Update button state
    startBtn.disabled = !canStart;
    startBtn.title = canStart ? '' : errorMessage;
    
    if (canStart) {
        startBtn.style.opacity = '1';
        startBtn.style.cursor = 'pointer';
    } else {
        startBtn.style.opacity = '0.5';
        startBtn.style.cursor = 'not-allowed';
    }
}

// Game Start
function startGame() {
    soundSystem?.playClickSound();
    
    // Validate all player names
    if (!gameState.validatePlayerNames()) {
        utils.showToast('❌ Lütfen tüm oyuncuların geçerli isimlerini girin!');
        return;
    }
    
    // Update player names from inputs
    gameState.players.forEach((player, index) => {
        const nameInput = document.getElementById(`player${index}-name`);
        if (nameInput) {
            player.name = nameInput.value.trim();
            player.score = 0;
        }
    });
    
    // Reset game state
    gameState.currentQuestion = 0;
    gameState.currentPlayer = 0;
    
    // Prepare questions
    if (!gameState.prepareQuestions()) {
        utils.showToast('❌ Sorular hazırlanamadı! Lütfen sayfayı yenileyin.');
        return;
    }
    
    // Create game UI
    createGameHeader();
    
    // Start background music
    if (soundSystem && !gameState.isMuted) {
        soundSystem.startBackgroundMusic();
    }
    
    // Show game screen and load first question
    showGame();
    loadNextQuestion();
    
    console.log('🎮 Local game started with', gameState.players.length, 'players');
}

// Game UI Creation
function createGameHeader() {
    const gameHeader = document.getElementById('game-header');
    gameHeader.innerHTML = '';
    
    gameState.players.forEach((player, index) => {
        const playerInfo = document.createElement('div');
        playerInfo.className = 'player-info';
        playerInfo.id = `player${index}-info`;
        
        playerInfo.innerHTML = `
            <div class="player-avatar">${player.character}</div>
            <div class="player-details">
                <h3>${player.name}</h3>
                <div class="score" id="player${index}-score">0</div>
            </div>
        `;
        
        gameHeader.appendChild(playerInfo);
        
        // Add VS divider between players (except after the last one)
        if (index < gameState.players.length - 1) {
            const vsDivider = document.createElement('div');
            vsDivider.className = 'vs-divider';
            vsDivider.textContent = 'VS';
            gameHeader.appendChild(vsDivider);
        }
    });
    
    updateTurnIndicator();
}

function updateTurnIndicator() {
    const turnIndicator = document.getElementById('turn-indicator');
    if (!turnIndicator) return;
    
    const currentPlayerName = gameState.players[gameState.currentPlayer].name;
    turnIndicator.textContent = `🎯 ${currentPlayerName} Sırası`;
    
    // Update player info visual states
    gameState.players.forEach((_, index) => {
        const playerInfo = document.getElementById(`player${index}-info`);
        if (playerInfo) {
            playerInfo.classList.remove('active', 'inactive');
            
            if (index === gameState.currentPlayer) {
                playerInfo.classList.add('active');
            } else {
                playerInfo.classList.add('inactive');
            }
        }
    });
}

// Question Management
function loadNextQuestion() {
    if (gameState.currentQuestion >= gameState.questions.length) {
        endGame();
        return;
    }
    
    const question = gameState.getCurrentQuestion();
    if (!question) {
        utils.showToast('❌ Soru yüklenemedi!');
        endGame();
        return;
    }
    
    // Update question display
    document.getElementById('question-number').textContent = 
        `Soru ${gameState.currentQuestion + 1}/${gameState.questionCount}`;
    document.getElementById('question-text').textContent = question.soru;
    
    // Create answer buttons
    const answersGrid = document.getElementById('answers-grid');
    answersGrid.innerHTML = '';
    
    const options = [
        question.secenekler.A, 
        question.secenekler.B, 
        question.secenekler.C, 
        question.secenekler.D
    ];
    
    options.forEach((option, index) => {
        const answerBtn = document.createElement('button');
        answerBtn.className = 'answer-btn';
        answerBtn.textContent = `${String.fromCharCode(65 + index)}) ${option}`;
        answerBtn.onclick = () => selectAnswer(index);
        answersGrid.appendChild(answerBtn);
    });
    
    startTimer();
}

function selectAnswer(selectedIndex) {
    if (!gameState.gameActive) return;
    
    const question = gameState.getCurrentQuestion();
    const correctIndex = ['A', 'B', 'C', 'D'].indexOf(question.dogru);
    const isCorrect = selectedIndex === correctIndex;
    
    // Stop timer
    clearInterval(gameState.timer);
    gameState.gameActive = false;
    
    // Update score
    gameState.updateScore(gameState.currentPlayer, isCorrect);
    
    // Play sound
    if (soundSystem) {
        if (isCorrect) {
            soundSystem.playCorrectSound();
        } else {
            soundSystem.playWrongSound();
        }
    }
    
    // Update score display
    const scoreElement = document.getElementById(`player${gameState.currentPlayer}-score`);
    if (scoreElement) {
        scoreElement.textContent = gameState.players[gameState.currentPlayer].score;
    }
    
    // Visual feedback on answer buttons
    const answerButtons = document.querySelectorAll('.answer-btn');
    answerButtons[selectedIndex]?.classList.add(isCorrect ? 'correct' : 'wrong');
    answerButtons[correctIndex]?.classList.add('correct');
    
    // Disable all buttons
    answerButtons.forEach(btn => btn.disabled = true);
    
    // Move to next question after delay
    setTimeout(() => {
        if (gameState.nextQuestion()) {
            updateTurnIndicator();
            loadNextQuestion();
        } else {
            endGame();
        }
    }, 2000);
    
    console.log(`🎯 Answer ${selectedIndex} selected, correct: ${isCorrect}`);
}

function startTimer() {
    gameState.timeLeft = GAME_CONFIG.TIMER_DURATION;
    gameState.gameActive = true;
    
    const timerFill = document.getElementById('timer-fill');
    if (timerFill) {
        timerFill.style.width = '100%';
    }
    
    gameState.timer = setInterval(() => {
        gameState.timeLeft--;
        
        const percentage = (gameState.timeLeft / GAME_CONFIG.TIMER_DURATION) * 100;
        if (timerFill) {
            timerFill.style.width = percentage + '%';
        }
        
        // Play warning sound in last 5 seconds
        if (gameState.timeLeft <= 5 && gameState.timeLeft > 0) {
            soundSystem?.playTimerSound();
        }
        
        // Time's up
        if (gameState.timeLeft <= 0) {
            selectAnswer(-1); // Wrong answer for timeout
        }
    }, 1000);
}

// Game End
function endGame() {
    const winners = gameState.getWinners();
    const sortedPlayers = gameState.getSortedPlayers();
    
    // Determine winner text
    let winnerText;
    if (winners.length === 1) {
        winnerText = `🎉 ${winners[0].name} Kazandı!`;
    } else if (winners.length > 1) {
        winnerText = `🎉 ${winners.map(w => w.name).join(' & ')} Kazandı!`;
    } else {
        winnerText = '🤝 Berabere!';
    }
    
    // Play victory sound
    soundSystem?.playVictorySound();
    
    // Create result screen
    createResultScreen(winnerText, winners, sortedPlayers);
    
    // Save to leaderboard
    saveToLeaderboard(winners.length === 1 ? winners[0] : null);
    
    // Show results
    showResults();
    
    console.log('🏆 Game ended, winner:', winnerText);
}

function createResultScreen(winnerText, winners, sortedPlayers) {
    // Update winner display
    const winnerTextElement = document.getElementById('winner-text');
    const winnerCrownElement = document.getElementById('winner-crown');
    
    if (winnerTextElement) {
        winnerTextElement.textContent = winnerText;
    }
    
    if (winnerCrownElement) {
        winnerCrownElement.textContent = winners.length === 1 ? '👑' : '🤝';
    }
    
    // Create final scores display
    const finalScores = document.getElementById('final-scores');
    if (finalScores) {
        finalScores.innerHTML = '';
        
        sortedPlayers.forEach(player => {
            const scoreElement = document.createElement('div');
            scoreElement.className = 'final-score';
            scoreElement.innerHTML = `
                <div class="avatar">${player.character}</div>
                <div class="name">${player.name}</div>
                <div class="score">${player.score}</div>
            `;
            finalScores.appendChild(scoreElement);
        });
    }
}

// Initialize local game settings when page loads
document.addEventListener('DOMContentLoaded', () => {
    setupGameSettings();
    console.log('🎮 Local game system ready');
});