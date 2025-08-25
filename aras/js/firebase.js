// Firebase Integration
// Created by: Aras Gaygusuz - ArsanaGames

let firebaseApp = null;
let database = null;
let auth = null;
let isFirebaseInitialized = false;

// Room Management
let roomRef = null;
let playersRef = null;
let gameRef = null;

function initializeFirebase() {
    try {
        // Initialize Firebase
        firebaseApp = firebase.initializeApp(FIREBASE_CONFIG);
        database = firebase.database();
        auth = firebase.auth();
        
        // Test connection
        database.ref('.info/connected').on('value', (snapshot) => {
            const connected = snapshot.val();
            updateConnectionStatus(connected, connected ? 'Firebase Bağlandı' : 'Firebase Bağlantı Kesildi');
            isFirebaseInitialized = connected;
        });
        
        console.log('🔥 Firebase initialized successfully');
        return true;
        
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        updateConnectionStatus(false, 'Firebase Hatası');
        isFirebaseInitialized = false;
        return false;
    }
}

function updateConnectionStatus(connected, message) {
    const dot = document.getElementById('connection-dot');
    const text = document.getElementById('connection-text');
    
    if (dot && text) {
        if (connected) {
            dot.classList.add('connected');
            text.textContent = message || 'Bağlandı';
        } else {
            dot.classList.remove('connected');
            text.textContent = message || 'Bağlantı Kesildi';
        }
    }
}

// Export to global scope
window.initializeFirebase = initializeFirebase;
window.updateConnectionStatus = updateConnectionStatus;
window.isFirebaseInitialized = () => isFirebaseInitialized;

console.log('🔥 Firebase integration ready');