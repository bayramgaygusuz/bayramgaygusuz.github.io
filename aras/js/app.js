// Main Application
// Futbol Bilgi Arena v2.0 - Mobile-First
// Created by: Aras Gaygusuz - ArsanaGames

// Application Initialization
async function initApp() {
    console.log('⚽ Futbol Bilgi Arena v2.0 - Mobile-First Edition');
    console.log('🎮 Geliştirici: Aras Gaygusuz - ArsanaGames');
    console.log('📱 Mobile-optimized version loading...');
    
    try {
        // Load questions first
        utils.showLoading('Sorular yükleniyor...');
        await gameState.loadQuestions();
        
        // Initialize Firebase
        utils.showLoading('Firebase bağlantısı kuruluyor...');
        initializeFirebase();
        
        // Initialize sound system
        if (!soundSystem) {
            window.soundSystem = new SoundSystem();
        }
        
        // Setup event listeners
        setupEventListeners();
        
        // Check for room code in URL
        utils.checkURLForRoomCode();
        
        // Setup game settings
        setupGameSettings();
        
        // Optimize performance
        optimizePerformance();
        
        // Setup debug helpers (development only)
        setupDebugHelpers();
        
        utils.hideLoading();
        
        console.log('✅ Uygulama başarıyla başlatıldı!');
        
    } catch (error) {
        console.error('❌ App initialization error:', error);
        utils.hideLoading();
        utils.showToast('❌ Uygulama başlatılırken hata oluştu. Sayfa yenileniyor...');
        setTimeout(() => window.location.reload(), 2000);
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Prevent default touch behaviors for mobile optimization
    document.addEventListener('touchmove', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault(); // Prevent pinch zoom
        }
    }, { passive: false });
    
    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });
    
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            // Force recalculation of viewport
            document.body.style.height = window.innerHeight + 'px';
            setTimeout(() => {
                document.body.style.height = '100vh';
            }, 100);
        }, 100);
    });
    
    // Handle window resize
    window.addEventListener('resize', utils.debounce(() => {
        // Update CSS custom properties for viewport height
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }, 250));
    
    // Set initial viewport height
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (gameState.isOnline && window.roomRef && gameState.playerId) {
            // Update connection status
            window.roomRef.child(`players/${gameState.playerId}/connected`)
                .set(!document.hidden)
                .catch(console.warn);
        }
    });
    
    // Handle PWA install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install notification
        utils.showToast('📱 Bu uygulamayı ana ekranınıza ekleyebilirsiniz!');
        
        // Auto-prompt after delay
        setTimeout(() => {
            if (deferredPrompt && !localStorage.getItem('pwa-dismissed')) {
                deferredPrompt.prompt().then((choiceResult) => {
                    if (choiceResult.outcome === 'dismissed') {
                        localStorage.setItem('pwa-dismissed', 'true');
                    }
                    deferredPrompt = null;
                });
            }
        }, 30000); // 30 seconds
    });
    
    console.log('🎯 Event listeners configured');
}

// Performance and Memory Management
function optimizePerformance() {
    // Lazy load images and heavy content
    const observerOptions = {
        rootMargin: '50px 0px',
        threshold: 0.1
    };
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            }
        });
    }, observerOptions);
    
    // Observe all lazy images
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
    
    // Clean up old game data periodically
    setInterval(() => {
        if (performance.memory && performance.memory.usedJSHeapSize > 50000000) { // 50MB
            console.log('🧹 Cleaning up memory...');
            // Force garbage collection if available
            if (window.gc) window.gc();
        }
    }, 300000); // Every 5 minutes
    
    // Preload critical resources
    const preloadCritical = () => {
        // Preload critical sounds
        soundSystem?.initAudioContext();
    };
    
    // Preload on first user interaction
    document.addEventListener('touchstart', preloadCritical, { once: true });
    document.addEventListener('click', preloadCritical, { once: true });
}

// Debug and Development Helpers
function setupDebugHelpers() {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.search.includes('debug=true')) {
        // Development mode
        window.DEBUG = true;
        window.gameState = gameState;
        window.soundSystem = soundSystem;
        window.screenManager = screenManager;
        
        console.log('🐛 Debug mode active');
        console.log('🎮 Available debug commands:');
        console.log('   Ctrl+Shift+R: Reset game state');
        console.log('   Ctrl+Shift+L: Clear localStorage');
        console.log('   Ctrl+Shift+S: Toggle sound');
    }
}

// Application Error Handling
function setupErrorHandling() {
    window.addEventListener('error', (e) => {
        console.error('❌ Global error:', e.error);
        utils.showToast('❌ Bir hata oluştu. Sayfa yenileniyor...');
        setTimeout(() => window.location.reload(), 3000);
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('❌ Unhandled promise rejection:', e.reason);
        e.preventDefault();
    });
}

// Clean up on page unload
function setupCleanup() {
    window.addEventListener('beforeunload', () => {
        // Clean up Firebase connections
        if (gameState.isOnline && window.roomRef) {
            window.leaveRoom?.();
        }
        
        // Stop sounds
        soundSystem?.stopBackgroundMusic();
        
        // Clear timers
        if (gameState.timer) {
            clearInterval(gameState.timer);
        }
        
        console.log('🧹 Cleanup completed');
    });
}

// Application Ready
function appReady() {
    // Remove loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
    
    // Show welcome message for first-time users
    if (!localStorage.getItem('visited')) {
        localStorage.setItem('visited', 'true');
        setTimeout(() => {
            utils.showToast('⚽ Futbol Bilgi Arena\'na hoş geldiniz! ArsanaGames\'in yeni mobil deneyimi.');
        }, 1000);
    }
    
    // Analytics (if needed)
    if (typeof gtag !== 'undefined') {
        gtag('event', 'app_launch', {
            app_version: GAME_CONFIG.VERSION,
            platform: utils.isMobileDevice() ? 'mobile' : 'desktop'
        });
    }
    
    console.log('🎉 Futbol Bilgi Arena hazır!');
}

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
    setupErrorHandling();
    setupCleanup();
    
    try {
        await initApp();
        appReady();
    } catch (error) {
        console.error('❌ Fatal initialization error:', error);
        document.body.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                padding: 20px;
                text-align: center;
                font-family: Arial, sans-serif;
                background: linear-gradient(-45deg, #1e3c72, #2a5298);
                color: white;
            ">
                <div style="font-size: 4rem; margin-bottom: 20px;">⚽</div>
                <h1>Futbol Bilgi Arena</h1>
                <p>Uygulama başlatılamadı. Lütfen sayfayı yenileyin.</p>
                <button onclick="window.location.reload()" style="
                    background: linear-gradient(45deg, #00c9ff, #92fe9d);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 15px;
                    font-size: 1rem;
                    margin-top: 20px;
                    cursor: pointer;
                ">🔄 Sayfayı Yenile</button>
            </div>
        `;
    }
});

// Export for debugging
if (typeof window !== 'undefined' && window.location && 
    (window.location.hostname === 'localhost' || window.location.search.includes('debug=true'))) {
    window.initApp = initApp;
    window.appReady = appReady;
}

console.log('📱 Futbol Bilgi Arena v2.0 - Mobile-First Edition');
console.log('🎮 Created by: Aras Gaygusuz - ArsanaGames');
console.log('🚀 Application script loaded');