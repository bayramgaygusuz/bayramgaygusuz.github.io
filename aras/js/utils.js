// Utility Functions
// Created by: Aras Gaygusuz - ArsanaGames

// Date and Time Utilities
function getWeekString() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((now - startOfYear) / (24 * 60 * 60 * 1000) + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${weekNumber}`;
}

function getTodayString() {
    return new Date().toDateString();
}

function formatDate(date) {
    return new Intl.DateTimeFormat('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

// Room Code Generation
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < GAME_CONFIG.ROOM_CODE_LENGTH; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// URL Management
function checkURLForRoomCode() {
    const roomCode = URL_PARAMS.get('room');
    
    if (roomCode && roomCode.length === GAME_CONFIG.ROOM_CODE_LENGTH) {
        document.getElementById('room-code-input').value = roomCode;
        
        // Auto-navigate to online mode
        setTimeout(() => {
            if (confirm(`${roomCode} kodlu odaya katılmak istiyor musunuz?`)) {
                selectOnlineMode();
                setTimeout(joinRoom, 500);
            }
        }, 1000);
        
        return roomCode;
    }
    
    return null;
}

function createGameURL(roomCode) {
    const baseURL = window.location.origin + window.location.pathname;
    return `${baseURL}?room=${roomCode}`;
}

// Sharing Functions
function shareRoom(roomCode) {
    if (!roomCode) return;
    
    soundSystem?.playClickSound();
    
    const gameUrl = createGameURL(roomCode);
    const shareText = `🎮 Futbol Bilgi Arena'da benimle oyna!

🏆 Oda Kodu: ${roomCode}
🔗 Direkt Link: ${gameUrl}

⚽ Hemen katıl ve kazanmaya çalış!`;
    
    if (navigator.share) {
        navigator.share({
            title: '⚽ Futbol Bilgi Arena',
            text: shareText,
            url: gameUrl
        }).catch(console.warn);
    } else {
        // Fallback to WhatsApp
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
    }
}

function copyRoomLink(roomCode) {
    if (!roomCode) return;
    
    soundSystem?.playClickSound();
    
    const gameUrl = createGameURL(roomCode);
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(gameUrl).then(() => {
            showToast('🔗 Oyun linki kopyalandı! Arkadaşlarınla paylaşabilirsin.');
        }).catch(() => {
            fallbackCopy(gameUrl);
        });
    } else {
        fallbackCopy(gameUrl);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast('🔗 Oyun linki kopyalandı!');
    } catch (err) {
        showToast('❌ Link kopyalanamadı. Manuel olarak paylaşın.');
    }
    
    document.body.removeChild(textArea);
}

// Toast Notifications
function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 25px;
        z-index: 10000;
        font-size: 0.9rem;
        text-align: center;
        max-width: 90%;
        animation: toastSlideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Add toast animations to CSS dynamically
function addToastAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes toastSlideIn {
            from { transform: translateX(-50%) translateY(100px); opacity: 0; }
            to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes toastSlideOut {
            from { transform: translateX(-50%) translateY(0); opacity: 1; }
            to { transform: translateX(-50%) translateY(100px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Input Validation
function validateInput(input, type = 'name') {
    const value = input.value?.trim();
    
    if (!value || value.length === 0) {
        markInputInvalid(input, 'Bu alan boş bırakılamaz');
        return false;
    }
    
    if (type === 'name') {
        if (gameState.containsBannedWords(value)) {
            markInputInvalid(input, 'Lütfen uygun bir isim girin');
            return false;
        }
        
        if (value.length > 20) {
            markInputInvalid(input, 'İsim çok uzun (max 20 karakter)');
            return false;
        }
    }
    
    if (type === 'roomCode') {
        if (value.length !== GAME_CONFIG.ROOM_CODE_LENGTH) {
            markInputInvalid(input, `Oda kodu ${GAME_CONFIG.ROOM_CODE_LENGTH} karakter olmalı`);
            return false;
        }
    }
    
    markInputValid(input);
    return true;
}

function markInputValid(input) {
    input.style.borderColor = 'rgba(0, 255, 136, 0.5)';
    input.style.backgroundColor = 'rgba(0, 255, 136, 0.1)';
    input.title = '';
}

function markInputInvalid(input, message) {
    input.style.borderColor = 'rgba(255, 107, 107, 0.8)';
    input.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
    input.title = message;
    
    // Show temporary error message
    showToast(`❌ ${message}`, 2000);
}

// Loading Management
function showLoading(message = 'Yükleniyor...') {
    let loader = document.getElementById('loading-overlay');
    
    if (!loader) {
        loader = document.createElement('div');
        loader.id = 'loading-overlay';
        loader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
        `;
        
        loader.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 20px; animation: spin 1s linear infinite;">⚽</div>
            <div style="font-size: 1.2rem;" id="loading-message">${message}</div>
        `;
        
        document.body.appendChild(loader);
        
        // Add spin animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    } else {
        document.getElementById('loading-message').textContent = message;
        loader.style.display = 'flex';
    }
}

function hideLoading() {
    const loader = document.getElementById('loading-overlay');
    if (loader) {
        loader.style.display = 'none';
    }
}

// Array Utilities
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Device Detection
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isIOSDevice() {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// Performance Utilities
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Initialize utilities
document.addEventListener('DOMContentLoaded', () => {
    addToastAnimations();
    
    // Add global click sound to all interactive elements
    document.addEventListener('click', (e) => {
        if (e.target.matches('.btn, .mode-card, .answer-btn, .character-option, .count-btn, .back-btn')) {
            soundSystem?.playClickSound();
        }
    });
    
    console.log('🔧 Utilities initialized');
});

// Export utilities to global scope
window.utils = {
    getWeekString,
    getTodayString,
    formatDate,
    generateRoomCode,
    checkURLForRoomCode,
    createGameURL,
    shareRoom,
    copyRoomLink,
    showToast,
    validateInput,
    markInputValid,
    markInputInvalid,
    showLoading,
    hideLoading,
    shuffleArray,
    isMobileDevice,
    isIOSDevice,
    debounce,
    throttle
};