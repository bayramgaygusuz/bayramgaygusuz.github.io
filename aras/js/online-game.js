// Online Game Management
// Created by: Aras Gaygusuz - ArsanaGames

// Room Creation and Joining
async function createRoom() {
    soundSystem?.playClickSound();
    
    if (!isFirebaseInitialized) {
        utils.showToast('❌ Firebase bağlantısı kurulamadı!');
        return;
    }

    try {
        utils.showLoading('Oda oluşturuluyor...');
        
        // Sign in anonymously
        await auth.signInAnonymously();
        gameState.playerId = auth.currentUser.uid;
        
        // Generate room code
        gameState.roomCode = utils.generateRoomCode();
        gameState.isHost = true;
        
        // Create room reference
        roomRef = database.ref('rooms/' + gameState.roomCode);
        
        const roomData = {
            host: gameState.playerId,
            questionCount: 10,
            gameStarted: false,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            players: {
                [gameState.playerId]: {
                    name: '',
                    character: GAME_CONFIG.AVAILABLE_CHARACTERS[0],
                    score: 0,
                    isHost: true,
                    connected: true,
                    joinedAt: firebase.database.ServerValue.TIMESTAMP
                }
            }
        };
        
        await roomRef.set(roomData);
        
        setupRoomListeners();
        
        // Update UI
        document.getElementById('room-code-display').textContent = gameState.roomCode;
        showWaitingRoom();
        document.getElementById('host-controls').style.display = 'block';
        
        updateWaitingRoom();
        utils.hideLoading();
        
        console.log('🏠 Room created:', gameState.roomCode);
        
    } catch (error) {
        console.error('❌ Error creating room:', error);
        utils.hideLoading();
        utils.showToast('❌ Oda oluşturulurken hata oluştu: ' + error.message);
    }
}

async function joinRoom() {
    soundSystem?.playClickSound();
    
    const roomCodeInput = document.getElementById('room-code-input');
    const roomCode = roomCodeInput.value.trim().toUpperCase();
    
    if (!utils.validateInput(roomCodeInput, 'roomCode')) {
        return;
    }

    if (!isFirebaseInitialized) {
        utils.showToast('❌ Firebase bağlantısı kurulamadı!');
        return;
    }

    try {
        utils.showLoading('Odaya katılınıyor...');
        
        // Sign in anonymously
        await auth.signInAnonymously();
        gameState.playerId = auth.currentUser.uid;
        
        gameState.roomCode = roomCode;
        gameState.isHost = false;
        
        // Check if room exists
        roomRef = database.ref('rooms/' + roomCode);
        const roomSnapshot = await roomRef.once('value');
        
        if (!roomSnapshot.exists()) {
            utils.hideLoading();
            utils.showToast('❌ Oda bulunamadı! Lütfen oda kodunu kontrol edin.');
            return;
        }
        
        const roomData = roomSnapshot.val();
        
        if (roomData.gameStarted) {
            utils.hideLoading();
            utils.showToast('❌ Bu oda zaten oyun başlamış!');
            return;
        }
        
        const playerCount = Object.keys(roomData.players || {}).length;
        if (playerCount >= GAME_CONFIG.MAX_PLAYERS) {
            utils.hideLoading();
            utils.showToast('❌ Oda dolu! (Maksimum 8 oyuncu)');
            return;
        }
        
        // Add player to room
        const playerData = {
            name: '',
            character: GAME_CONFIG.AVAILABLE_CHARACTERS[playerCount],
            score: 0,
            isHost: false,
            connected: true,
            joinedAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        await roomRef.child('players/' + gameState.playerId).set(playerData);
        
        setupRoomListeners();
        
        // Update UI
        document.getElementById('room-code-display').textContent = gameState.roomCode;
        showWaitingRoom();
        document.getElementById('host-controls').style.display = 'none';
        
        utils.hideLoading();
        
        console.log('🚪 Joined room:', gameState.roomCode);
        
    } catch (error) {
        console.error('❌ Error joining room:', error);
        utils.hideLoading();
        utils.showToast('❌ Odaya katılırken hata oluştu: ' + error.message);
    }
}

// Room Management
function setupRoomListeners() {
    if (!roomRef) return;
    
    // Listen for player changes
    playersRef = roomRef.child('players');
    playersRef.on('value', (snapshot) => {
        updateWaitingRoom();
    });
    
    // Listen for game start
    gameRef = roomRef.child('gameState');
    gameRef.on('value', (snapshot) => {
        const gameStateData = snapshot.val();
        if (gameStateData && gameStateData.gameStarted) {
            startOnlineGameplay(gameStateData);
        }
    });
    
    // Listen for room deletion
    roomRef.on('value', (snapshot) => {
        if (!snapshot.exists()) {
            utils.showToast('❌ Oda kapatıldı!');
            leaveRoom();
        }
    });
}

async function updateWaitingRoom() {
    if (!roomRef) return;
    
    try {
        const snapshot = await roomRef.once('value');
        const roomData = snapshot.val();
        
        if (!roomData) return;
        
        const players = roomData.players || {};
        const playerList = Object.entries(players);
        
        // Update player count
        const playerCountElement = document.getElementById('player-count-waiting');
        if (playerCountElement) {
            playerCountElement.textContent = playerList.length;
        }
        
        // Update players list
        const waitingPlayersList = document.getElementById('waiting-players-list');
        if (waitingPlayersList) {
            waitingPlayersList.innerHTML = '';
            
            playerList.forEach(([playerId, playerData], index) => {
                const playerElement = document.createElement('div');
                playerElement.className = 'waiting-player';
                
                const playerName = playerData.name || `Oyuncu ${index + 1}`;
                
                playerElement.innerHTML = `
                    <div class="avatar">${playerData.character}</div>
                    <div class="info">
                        <div class="name">${playerName}</div>
                        ${playerData.isHost ? '<div class="host-badge">HOST</div>' : ''}
                    </div>
                    <div class="connection-indicator">
                        ${playerData.connected ? '🟢' : '🔴'}
                    </div>
                `;
                
                waitingPlayersList.appendChild(playerElement);
            });
        }
        
        // Update start button for host
        if (gameState.isHost) {
            const startBtn = document.getElementById('start-online-btn');
            if (startBtn) {
                const hostHasName = roomData.players[gameState.playerId]?.name?.trim();
                startBtn.disabled = !(playerList.length >= 2 && hostHasName);
            }
        }
        
    } catch (error) {
        console.error('❌ Error updating waiting room:', error);
    }
}

// Player Name Management
async function updatePlayerName() {
    if (!roomRef || !gameState.playerId) {
        utils.showToast('❌ Bağlantı hatası! Lütfen sayfayı yenileyin.');
        return;
    }
    
    const nameInput = document.getElementById('online-player-name');
    if (!nameInput) {
        console.error('❌ Name input not found');
        return;
    }
    
    if (!utils.validateInput(nameInput, 'name')) {
        nameInput.focus();
        return;
    }
    
    const playerName = nameInput.value.trim();
    
    try {
        await roomRef.child('players/' + gameState.playerId + '/name').set(playerName);
        soundSystem?.playClickSound();
        
        // Update UI to show success
        nameInput.disabled = true;
        nameInput.style.backgroundColor = 'rgba(0, 255, 136, 0.2)';
        
        const btn = nameInput.parentElement.querySelector('button');
        if (btn) {
            btn.textContent = '✅ KAYDEDİLDİ';
            btn.disabled = true;
            btn.style.backgroundColor = 'rgba(0, 255, 136, 0.3)';
        }
        
        console.log('✅ Name updated successfully:', playerName);
        
    } catch (error) {
        console.error('❌ Error updating name:', error);
        utils.showToast('❌ İsim güncellenirken hata oluştu! Lütfen tekrar deneyin.');
    }
}

// Game Start
async function startOnlineGame() {
    if (!gameState.isHost || !roomRef) return;
    
    soundSystem?.playClickSound();
    
    try {
        const snapshot = await roomRef.once('value');
        const roomData = snapshot.val();
        const players = roomData.players || {};
        
        if (Object.keys(players).length < 2) {
            utils.showToast('❌ En az 2 oyuncu gerekli!');
            return;
        }
        
        // Get selected question count
        const selectedCount = document.querySelector('#waiting-screen .count-btn.selected');
        const questionCount = selectedCount ? parseInt(selectedCount.dataset.count) : 10;
        
        // Prepare game data
        const gameStateData = {
            gameStarted: true,
            currentQuestion: 0,
            currentPlayer: 0,
            questionCount: questionCount,
            questions: gameState.shuffleArray([...gameState.allQuestions]).slice(0, questionCount),
            players: players,
            startedAt: firebase.database.ServerValue.TIMESTAMP
        };
        
        await roomRef.child('gameState').set(gameStateData);
        
        console.log('🎮 Online game started');
        
    } catch (error) {
        console.error('❌ Error starting online game:', error);
        utils.showToast('❌ Oyun başlatılırken hata oluştu!');
    }
}

function startOnlineGameplay(gameStateData) {
    // Convert players object to array
    gameState.players = Object.entries(gameStateData.players).map(([id, data]) => ({
        id: id,
        name: data.name || 'Oyuncu',
        character: data.character,
        score: data.score || 0
    }));
    
    gameState.questions = gameStateData.questions;
    gameState.questionCount = gameStateData.questionCount;
    gameState.currentQuestion = gameStateData.currentQuestion;
    gameState.currentPlayer = gameStateData.currentPlayer;
    
    createGameHeader();
    showGame();
    loadNextQuestion();
    
    if (soundSystem && !gameState.isMuted) {
        soundSystem.startBackgroundMusic();
    }
    
    console.log('🎮 Online gameplay started');
}

// Room Leave
async function leaveRoom() {
    soundSystem?.playClickSound();
    
    try {
        if (roomRef && gameState.playerId) {
            // Remove player from room
            await roomRef.child('players/' + gameState.playerId).remove();
            
            if (gameState.isHost) {
                // Transfer host to another player or delete room
                const snapshot = await roomRef.once('value');
                const roomData = snapshot.val();
                const remainingPlayers = roomData?.players || {};
                
                if (Object.keys(remainingPlayers).length > 0) {
                    const newHostId = Object.keys(remainingPlayers)[0];
                    await roomRef.child('host').set(newHostId);
                    await roomRef.child('players/' + newHostId + '/isHost').set(true);
                } else {
                    await roomRef.remove();
                }
            }
            
            // Clean up listeners
            if (playersRef) playersRef.off();
            if (gameRef) gameRef.off();
            if (roomRef) roomRef.off();
        }
        
        // Reset state
        gameState.isOnline = false;
        gameState.roomCode = null;
        gameState.isHost = false;
        gameState.playerId = null;
        roomRef = null;
        playersRef = null;
        gameRef = null;
        
        showOnlineMode();
        
        console.log('🚪 Left room successfully');
        
    } catch (error) {
        console.error('❌ Error leaving room:', error);
        showOnlineMode();
    }
}

// Room Sharing
function shareRoom() {
    if (!gameState.roomCode) return;
    utils.shareRoom(gameState.roomCode);
}

function copyRoomLink() {
    if (!gameState.roomCode) return;
    utils.copyRoomLink(gameState.roomCode);
}

// Export functions to global scope
window.createRoom = createRoom;
window.joinRoom = joinRoom;
window.updatePlayerName = updatePlayerName;
window.startOnlineGame = startOnlineGame;
window.leaveRoom = leaveRoom;
window.shareRoom = shareRoom;
window.copyRoomLink = copyRoomLink;

console.log('🌐 Online game system ready');