// Firebase Configuration
// Created by: Aras Gaygusuz - ArsanaGames

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyCmq9chB7o-n3k32OkR9TVga56_QV8vm1A",
    authDomain: "futbol-bilgi-arena.firebaseapp.com",
    databaseURL: "https://futbol-bilgi-arena-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "futbol-bilgi-arena",
    storageBucket: "futbol-bilgi-arena.firebasestorage.app",
    messagingSenderId: "606664987575",
    appId: "1:606664987575:web:656c192b71b912a9a4ce32",
    measurementId: "G-PNBD9J1RN3"
};

// Game Configuration
const GAME_CONFIG = {
    VERSION: "2.0",
    DEVELOPER: "Aras Gaygusuz - ArsanaGames",
    
    // Game Settings
    MAX_PLAYERS: 8,
    MIN_PLAYERS: 2,
    DEFAULT_QUESTION_COUNT: 10,
    TIMER_DURATION: 15, // seconds
    POINTS_CORRECT: 10,
    POINTS_WRONG: -5,
    
    // Characters
    AVAILABLE_CHARACTERS: ['⚽', '🏆', '👑', '🎯', '🔥', '⭐', '💎', '🚀'],
    
    // Room Settings
    ROOM_CODE_LENGTH: 6,
    
    // Sound Settings
    SOUND_VOLUME: {
        SFX: 0.7,
        MUSIC: 0.1
    }
};

// Fallback Questions (when sorular.json fails to load)
const FALLBACK_QUESTIONS = [
    {
        soru: "Hangi takım 2018 FIFA Dünya Kupası'nı kazanmıştır?",
        secenekler: {
            A: "Fransa",
            B: "Hırvatistan", 
            C: "Belçika",
            D: "İngiltere"
        },
        dogru: "A"
    },
    {
        soru: "Lionel Messi hangi ülke milli takımında oynamaktadır?",
        secenekler: {
            A: "İspanya",
            B: "Arjantin",
            C: "Brezilya",
            D: "Portekiz"
        },
        dogru: "B"
    },
    {
        soru: "Real Madrid'in stadyumunun adı nedir?",
        secenekler: {
            A: "Camp Nou",
            B: "Wembley",
            C: "Santiago Bernabéu",
            D: "Old Trafford"
        },
        dogru: "C"
    },
    {
        soru: "UEFA Şampiyonlar Ligi'ni en çok hangi takım kazanmıştır?",
        secenekler: {
            A: "Barcelona",
            B: "Real Madrid",
            C: "AC Milan",
            D: "Liverpool"
        },
        dogru: "B"
    },
    {
        soru: "Futbolda penaltı noktası kalede kaç metre uzaklıktadır?",
        secenekler: {
            A: "10 metre",
            B: "11 metre",
            C: "12 metre",
            D: "9 metre"
        },
        dogru: "B"
    },
    {
        soru: "Bir maçta aynı takımdan sahada kaç oyuncu bulunur?",
        secenekler: {
            A: "11",
            B: "10",
            C: "9",
            D: "12"
        },
        dogru: "A"
    },
    {
        soru: "Serbest vuruşta baraj ile top arası asgari mesafe nedir?",
        secenekler: {
            A: "9.15 m",
            B: "7.5 m",
            C: "5 m",
            D: "11 m"
        },
        dogru: "A"
    },
    {
        soru: "Dünya Kupası kaç yılda bir düzenlenir?",
        secenekler: {
            A: "2 yıl",
            B: "3 yıl",
            C: "4 yıl",
            D: "5 yıl"
        },
        dogru: "C"
    }
];

// URL Parameters
const URL_PARAMS = new URLSearchParams(window.location.search);

// Export configurations
window.FIREBASE_CONFIG = FIREBASE_CONFIG;
window.GAME_CONFIG = GAME_CONFIG;
window.FALLBACK_QUESTIONS = FALLBACK_QUESTIONS;
window.URL_PARAMS = URL_PARAMS;