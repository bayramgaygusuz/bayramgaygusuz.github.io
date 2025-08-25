// Game State Management
// Created by: Aras Gaygusuz - ArsanaGames

class GameState {
    constructor() {
        this.reset();
    }

    reset() {
        this.isOnline = false;
        this.roomCode = null;
        this.isHost = false;
        this.playerId = null;
        
        this.players = [
            {name: '', character: GAME_CONFIG.AVAILABLE_CHARACTERS[0], score: 0},
            {name: '', character: GAME_CONFIG.AVAILABLE_CHARACTERS[1], score: 0}
        ];
        
        this.currentQuestion = 0;
        this.currentPlayer = 0;
        this.questionCount = GAME_CONFIG.DEFAULT_QUESTION_COUNT;
        this.questions = [];
        this.allQuestions = [];
        
        this.isMuted = false;
        this.timer = null;
        this.timeLeft = GAME_CONFIG.TIMER_DURATION;
        this.gameActive = false;
        
        console.log('🎮 Game state reset');
    }

    // Player Management
    addPlayer() {
        if (this.players.length >= GAME_CONFIG.MAX_PLAYERS) return false;
        
        const newPlayer = {
            name: '',
            character: GAME_CONFIG.AVAILABLE_CHARACTERS[this.players.length],
            score: 0
        };
        
        this.players.push(newPlayer);
        console.log(`👤 Player added. Total: ${this.players.length}`);
        return true;
    }

    removePlayer() {
        if (this.players.length <= GAME_CONFIG.MIN_PLAYERS) return false;
        
        this.players.pop();
        console.log(`👤 Player removed. Total: ${this.players.length}`);
        return true;
    }

    // Question Management
    async loadQuestions() {
        try {
            // Try different possible paths
            const paths = ['./data/sorular.json', './sorular.json', 'data/sorular.json', 'sorular.json'];
            
            let response = null;
            let loadedPath = null;
            
            for (const path of paths) {
                try {
                    response = await fetch(path);
                    if (response.ok) {
                        loadedPath = path;
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (!response || !response.ok) {
                throw new Error('Soru dosyası hiçbir yolda bulunamadı');
            }
            
            const data = await response.json();
            
            // Handle different JSON structures
            if (Array.isArray(data)) {
                this.allQuestions = data;
            } else if (data.sorular && Array.isArray(data.sorular)) {
                this.allQuestions = data.sorular;
            } else if (data.questions && Array.isArray(data.questions)) {
                this.allQuestions = data.questions;
            } else {
                throw new Error('JSON formatı tanınamadı');
            }
            
            if (this.allQuestions.length === 0) {
                throw new Error('Soru listesi boş');
            }
            
            console.log(`📚 ${this.allQuestions.length} soru yüklendi (${loadedPath})`);
            return true;
            
        } catch (error) {
            console.warn('📚 Sorular yüklenemedi, fallback sorular kullanılıyor:', error.message);
            this.allQuestions = [...FALLBACK_QUESTIONS];
            
            // Show error message to user
            this.showErrorMessage('Soru dosyası bulunamadı, örnek sorularla devam ediliyor.');
            return false;
        }
    }

    prepareQuestions() {
        if (this.allQuestions.length === 0) {
            console.error('❌ Sorular yüklenmemiş!');
            return false;
        }
        
        this.questions = this.shuffleArray([...this.allQuestions])
            .slice(0, this.questionCount);
        
        console.log(`🎯 ${this.questions.length} soru oyun için hazırlandı`);
        return true;
    }

    // Game Flow
    nextQuestion() {
        this.currentQuestion++;
        this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
        
        return this.currentQuestion < this.questions.length;
    }

    getCurrentQuestion() {
        if (this.currentQuestion >= this.questions.length) return null;
        return this.questions[this.currentQuestion];
    }

    // Score Management
    updateScore(playerIndex, isCorrect) {
        const player = this.players[playerIndex];
        if (!player) return;
        
        if (isCorrect) {
            player.score += GAME_CONFIG.POINTS_CORRECT;
        } else {
            player.score = Math.max(0, player.score + GAME_CONFIG.POINTS_WRONG);
        }
        
        console.log(`🏆 ${player.name} skoru: ${player.score}`);
    }

    getWinners() {
        const maxScore = Math.max(...this.players.map(p => p.score));
        return this.players.filter(p => p.score === maxScore);
    }

    getSortedPlayers() {
        return [...this.players].sort((a, b) => b.score - a.score);
    }

    // Utility Methods
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 107, 107, 0.9);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            z-index: 10000;
            font-weight: bold;
            animation: slideDown 0.5s ease;
            max-width: 90%;
            text-align: center;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.style.opacity = '0';
            setTimeout(() => errorDiv.remove(), 500);
        }, 5000);
    }

    // Validation
    validatePlayerNames() {
        return this.players.every(player => {
            const name = player.name?.trim();
            return name && name.length > 0 && !this.containsBannedWords(name);
        });
    }

    containsBannedWords(text) {
        if (!text) return false;
        
        const bannedWords = [
            'aptal', 'salak', 'gerizekalı', 'mal', 'beyinsiz', 
            'dangalak', 'budala', 'ahmak', 'embesil'
        ];
        
        const normalizedText = text.toLowerCase()
            .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
            .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c');
        
        return bannedWords.some(word => normalizedText.includes(word));
    }

    // Debug
    getStateInfo() {
        return {
            isOnline: this.isOnline,
            playerCount: this.players.length,
            questionCount: this.questionCount,
            currentQuestion: this.currentQuestion,
            currentPlayer: this.currentPlayer,
            gameActive: this.gameActive
        };
    }
}

// Create global game state instance
window.gameState = new GameState();