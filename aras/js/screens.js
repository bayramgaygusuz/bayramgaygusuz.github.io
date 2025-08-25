// Screen Management
// Created by: Aras Gaygusuz - ArsanaGames

class ScreenManager {
    constructor() {
        this.currentScreen = 'menu-screen';
        this.screenHistory = [];
        this.init();
    }

    init() {
        // Hide loading screen after initialization
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
        }, 2000);

        console.log('📱 Screen manager initialized');
    }

    showScreen(screenId, animation = 'fade') {
        const currentScreenElement = document.querySelector('.screen.active');
        const newScreenElement = document.getElementById(screenId);

        if (!newScreenElement) {
            console.error(`❌ Screen not found: ${screenId}`);
            return;
        }

        // Add to history (for back navigation)
        if (this.currentScreen && this.currentScreen !== screenId) {
            this.screenHistory.push(this.currentScreen);
        }

        // Remove active class from current screen
        if (currentScreenElement) {
            currentScreenElement.classList.remove('active');
        }

        // Show new screen
        newScreenElement.classList.add('active');
        
        // Add animation class if specified
        if (animation !== 'fade') {
            newScreenElement.classList.add(animation);
            setTimeout(() => {
                newScreenElement.classList.remove(animation);
            }, 300);
        }

        this.currentScreen = screenId;
        
        // Update document title based on screen
        this.updateTitle(screenId);
        
        // Scroll to top
        newScreenElement.scrollTop = 0;

        console.log(`📱 Screen changed to: ${screenId}`);
    }

    goBack() {
        if (this.screenHistory.length > 0) {
            const previousScreen = this.screenHistory.pop();
            this.showScreen(previousScreen, 'slide-down');
            return true;
        }
        return false;
    }

    updateTitle(screenId) {
        const titles = {
            'menu-screen': 'Futbol Bilgi Arena - Ana Menü',
            'gamemode-screen': 'Oyun Modu Seçimi',
            'online-screen': 'Online Oyun',
            'waiting-screen': 'Oyuncular Bekleniyor',
            'settings-screen': 'Oyun Ayarları',
            'setup-screen': 'Oyuncu Kurulumu',
            'game-screen': 'Oyun - Futbol Bilgi Arena',
            'result-screen': 'Sonuçlar - Futbol Bilgi Arena',
            'leaderboard-screen': 'Lider Tablosu'
        };

        document.title = titles[screenId] || 'Futbol Bilgi Arena';
    }

    getCurrentScreen() {
        return this.currentScreen;
    }

    isGameScreen() {
        return this.currentScreen === 'game-screen';
    }
}

// Global screen navigation functions
function showMenu() {
    screenManager.showScreen('menu-screen');
}

function showGameModeSelection() {
    screenManager.showScreen('gamemode-screen');
}

function selectLocalMode() {
    gameState.isOnline = false;
    screenManager.showScreen('settings-screen');
}

function selectOnlineMode() {
    if (!window.isFirebaseInitialized) {
        utils.showToast('❌ Firebase bağlantısı kurulamadı. Lütfen sayfayı yenileyin.');
        return;
    }
    
    gameState.isOnline = true;
    screenManager.showScreen('online-screen');
}

function showGameSettings() {
    screenManager.showScreen('settings-screen');
}

function showPlayerSetup() {
    screenManager.showScreen('setup-screen');
    setupPlayerCards();
}

function showLeaderboard() {
    screenManager.showScreen('leaderboard-screen');
    displayLeaderboard();
}

function showGame() {
    screenManager.showScreen('game-screen');
}

function showResults() {
    screenManager.showScreen('result-screen');
}

function showWaitingRoom() {
    screenManager.showScreen('waiting-screen');
}

function showOnlineMode() {
    screenManager.showScreen('online-screen');
}

// Back button handling
function handleBackButton() {
    if (screenManager.goBack()) {
        return;
    }
    
    // If no history, go to main menu
    showMenu();
}

// Leaderboard tab switching
function switchLeaderboardTab(tabType) {
    soundSystem?.playClickSound();
    
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update content
    document.querySelectorAll('.leaderboard-list').forEach(list => {
        list.classList.remove('active');
    });
    
    const targetList = document.getElementById(`${tabType}-leaders`);
    if (targetList) {
        targetList.classList.add('active');
    }
}

// Game restart
function restartGame() {
    soundSystem?.playClickSound();
    
    if (gameState.isOnline) {
        // For online games, go back to waiting room or main menu
        if (window.roomRef) {
            showWaitingRoom();
        } else {
            showMenu();
        }
    } else {
        // For local games, restart with same settings
        gameState.reset();
        gameState.questionCount = parseInt(document.querySelector('.count-btn.selected')?.dataset.count || '10');
        showPlayerSetup();
    }
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    // Handle back navigation with escape key
    if (e.key === 'Escape') {
        e.preventDefault();
        handleBackButton();
        return;
    }
    
    // Game screen specific controls
    if (screenManager.isGameScreen() && gameState.gameActive) {
        const answerButtons = document.querySelectorAll('.answer-btn');
        
        switch (e.key) {
            case '1':
            case 'a':
            case 'A':
                e.preventDefault();
                answerButtons[0]?.click();
                break;
            case '2':
            case 'b':
            case 'B':
                e.preventDefault();
                answerButtons[1]?.click();
                break;
            case '3':
            case 'c':
            case 'C':
                e.preventDefault();
                answerButtons[2]?.click();
                break;
            case '4':
            case 'd':
            case 'D':
                e.preventDefault();
                answerButtons[3]?.click();
                break;
        }
    }
    
    // Mute toggle with 'M' key
    if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleMute();
    }
});

// Handle browser back button
window.addEventListener('popstate', (e) => {
    handleBackButton();
});

// Prevent page refresh/close during game
window.addEventListener('beforeunload', (e) => {
    if (screenManager.isGameScreen() && gameState.gameActive) {
        e.preventDefault();
        e.returnValue = 'Oyun devam ediyor. Sayfadan ayrılmak istediğinize emin misiniz?';
        return e.returnValue;
    }
    
    // Clean up online game connections
    if (gameState.isOnline && window.roomRef) {
        window.leaveRoom?.();
    }
});

// Handle visibility change (tab switching, app backgrounding)
document.addEventListener('visibilitychange', () => {
    if (gameState.isOnline && window.roomRef) {
        const playerId = gameState.playerId;
        if (playerId) {
            window.roomRef.child(`players/${playerId}/connected`)
                .set(!document.hidden)
                .catch(console.warn);
        }
    }
});

// Create global screen manager instance
window.screenManager = new ScreenManager();

// Mute button functionality
function toggleMute() {
    if (soundSystem) {
        const isMuted = soundSystem.toggleMute();
        gameState.isMuted = isMuted;
        
        // Update button visual state is handled in sound system
        console.log(`🔊 Sound ${isMuted ? 'muted' : 'unmuted'}`);
    }
}

console.log('📱 Screen management system ready');