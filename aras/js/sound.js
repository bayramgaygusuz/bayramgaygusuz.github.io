// Sound System
// Created by: Aras Gaygusuz - ArsanaGames

class SoundSystem {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.isMuted = false;
        this.backgroundMusic = null;
        this.init();
    }

    async init() {
        try {
            // Create audio context on first user interaction
            document.addEventListener('touchstart', this.initAudioContext.bind(this), { once: true });
            document.addEventListener('click', this.initAudioContext.bind(this), { once: true });
            
            console.log('🔊 Sound system initialized');
        } catch (error) {
            console.warn('🔇 Sound system initialization failed:', error);
        }
    }

    async initAudioContext() {
        if (this.audioContext) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            await this.createSounds();
            console.log('🎵 Audio context created');
        } catch (error) {
            console.warn('🔇 Audio context creation failed:', error);
        }
    }

    async createSounds() {
        const soundConfigs = {
            click: { frequency: 800, duration: 0.1, type: 'sine', volume: 0.3 },
            correct: { frequency: 1200, duration: 0.3, type: 'sine', volume: 0.5 },
            wrong: { frequency: 300, duration: 0.5, type: 'sawtooth', volume: 0.4 },
            timer: { frequency: 400, duration: 0.1, type: 'square', volume: 0.3 },
            victory: { 
                notes: [
                    { frequency: 523, duration: 0.2 }, // C5
                    { frequency: 659, duration: 0.2 }, // E5
                    { frequency: 784, duration: 0.2 }, // G5
                    { frequency: 1047, duration: 0.4 } // C6
                ],
                volume: 0.4
            }
        };

        for (const [name, config] of Object.entries(soundConfigs)) {
            this.sounds[name] = config;
        }
    }

    playSound(soundName) {
        if (this.isMuted || !this.audioContext) return;
        
        const config = this.sounds[soundName];
        if (!config) return;

        try {
            if (soundName === 'victory') {
                this.playVictorySequence(config);
            } else {
                this.playTone(config);
            }
        } catch (error) {
            console.warn(`🔇 Sound playback failed for ${soundName}:`, error);
        }
    }

    playTone(config) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = config.type || 'sine';
        oscillator.frequency.setValueAtTime(config.frequency, this.audioContext.currentTime);
        
        const volume = (config.volume || 0.3) * GAME_CONFIG.SOUND_VOLUME.SFX;
        gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + config.duration);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + config.duration);
    }

    playVictorySequence(config) {
        let startTime = this.audioContext.currentTime;
        
        config.notes.forEach((note, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(note.frequency, startTime);
            
            const volume = config.volume * GAME_CONFIG.SOUND_VOLUME.SFX;
            gainNode.gain.setValueAtTime(volume, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + note.duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + note.duration);
            
            startTime += note.duration;
        });
    }

    // Public methods
    playClickSound() { 
        this.playSound('click'); 
    }
    
    playCorrectSound() { 
        this.playSound('correct'); 
    }
    
    playWrongSound() { 
        this.playSound('wrong'); 
    }
    
    playTimerSound() { 
        this.playSound('timer'); 
    }
    
    playVictorySound() { 
        setTimeout(() => this.playSound('victory'), 500);
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        console.log(`🔊 Sound ${this.isMuted ? 'muted' : 'unmuted'}`);
        
        // Update mute button
        const muteBtn = document.getElementById('mute-btn');
        if (muteBtn) {
            muteBtn.textContent = this.isMuted ? '🔇' : '🔊';
            muteBtn.classList.toggle('muted', this.isMuted);
        }
        
        return this.isMuted;
    }

    // Background music (placeholder for future implementation)
    startBackgroundMusic() {
        if (this.isMuted) return;
        // Placeholder for stadium atmosphere or background music
        console.log('🎵 Background music would start here');
    }

    stopBackgroundMusic() {
        // Placeholder
        console.log('🎵 Background music would stop here');
    }
}

// Create global sound system instance
window.soundSystem = new SoundSystem();