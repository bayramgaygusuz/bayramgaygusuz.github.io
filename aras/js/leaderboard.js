// Leaderboard Management
// Created by: Aras Gaygusuz - ArsanaGames

// Save to Leaderboard
function saveToLeaderboard(winner) {
    const today = utils.getTodayString();
    const thisWeek = utils.getWeekString();

    let dailyLeaders = JSON.parse(localStorage.getItem('dailyLeaders') || '{}');
    let weeklyLeaders = JSON.parse(localStorage.getItem('weeklyLeaders') || '{}');

    const gameData = {
        players: gameState.players.map(p => ({ 
            name: p.name, 
            character: p.character, 
            score: p.score 
        })),
        winner: winner ? winner.name : 'Berabere',
        questionCount: gameState.questionCount,
        timestamp: Date.now(),
        isOnline: gameState.isOnline
    };

    // Add to daily leaderboard
    if (!dailyLeaders[today]) dailyLeaders[today] = [];
    dailyLeaders[today].push(gameData);

    // Add to weekly leaderboard
    if (!weeklyLeaders[thisWeek]) weeklyLeaders[thisWeek] = [];
    weeklyLeaders[thisWeek].push(gameData);

    // Keep only recent entries to avoid localStorage bloat
    if (dailyLeaders[today].length > 20) {
        dailyLeaders[today] = dailyLeaders[today].slice(-20);
    }

    if (weeklyLeaders[thisWeek].length > 100) {
        weeklyLeaders[thisWeek] = weeklyLeaders[thisWeek].slice(-100);
    }

    // Clean old entries (keep last 7 days and 4 weeks)
    cleanOldEntries(dailyLeaders, 7);
    cleanOldEntries(weeklyLeaders, 4);

    // Save to localStorage
    localStorage.setItem('dailyLeaders', JSON.stringify(dailyLeaders));
    localStorage.setItem('weeklyLeaders', JSON.stringify(weeklyLeaders));

    console.log('🏆 Game saved to leaderboard');

    // Also save to global leaderboard if online
    if (gameState.isOnline && isFirebaseInitialized) {
        saveToGlobalLeaderboard(winner);
    }
}

function cleanOldEntries(leaderboard, keepCount) {
    const keys = Object.keys(leaderboard).sort().reverse();
    if (keys.length > keepCount) {
        keys.slice(keepCount).forEach(key => {
            delete leaderboard[key];
        });
    }
}

// Global Leaderboard (Firebase)
async function saveToGlobalLeaderboard(winner) {
    if (!isFirebaseInitialized || !database) return;
    
    try {
        const leaderboardRef = database.ref('globalLeaderboard');
        const gameData = {
            players: gameState.players.map(p => ({ 
                name: p.name, 
                character: p.character, 
                score: p.score 
            })),
            winner: winner ? winner.name : 'Berabere',
            questionCount: gameState.questionCount,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            date: new Date().toISOString().split('T')[0] // YYYY-MM-DD
        };
        
        await leaderboardRef.push(gameData);
        console.log('🌐 Global leaderboard updated');
    } catch (error) {
        console.error('❌ Error saving to global leaderboard:', error);
    }
}

// Display Leaderboard
function displayLeaderboard() {
    if (isFirebaseInitialized) {
        displayGlobalLeaderboard();
    } else {
        displayLocalLeaderboard();
    }
}

function displayLocalLeaderboard() {
    const today = utils.getTodayString();
    const thisWeek = utils.getWeekString();

    const dailyLeaders = JSON.parse(localStorage.getItem('dailyLeaders') || '{}')[today] || [];
    const weeklyLeaders = JSON.parse(localStorage.getItem('weeklyLeaders') || '{}')[thisWeek] || [];

    renderLeaderboardData(dailyLeaders, weeklyLeaders, 'local');
}

async function displayGlobalLeaderboard() {
    if (!isFirebaseInitialized || !database) {
        displayLocalLeaderboard();
        return;
    }
    
    try {
        const today = new Date().toISOString().split('T')[0];
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Get daily data
        const dailySnapshot = await database.ref('globalLeaderboard')
            .orderByChild('date')
            .equalTo(today)
            .limitToLast(50)
            .once('value');
        
        const dailyData = dailySnapshot.val() || {};
        const dailyGames = Object.values(dailyData);
        
        // Get weekly data
        const weeklySnapshot = await database.ref('globalLeaderboard')
            .orderByChild('date')
            .startAt(weekAgo)
            .limitToLast(200)
            .once('value');
        
        const weeklyData = weeklySnapshot.val() || {};
        const weeklyGames = Object.values(weeklyData);
        
        renderLeaderboardData(dailyGames, weeklyGames, 'global');
        
    } catch (error) {
        console.error('❌ Error loading global leaderboard:', error);
        displayLocalLeaderboard(); // Fallback
    }
}

function renderLeaderboardData(dailyGames, weeklyGames, source) {
    renderDailyLeaderboard(dailyGames, source);
    renderWeeklyLeaderboard(weeklyGames, source);
}

function renderDailyLeaderboard(games, source) {
    const container = document.getElementById('daily-leaders');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (games.length === 0) {
        container.innerHTML = `
            <div class="leaderboard-entry">
                <div class="info">
                    <span class="trophy">🏆</span>
                    <span class="name">Bugün henüz oyun oynanmadı</span>
                </div>
            </div>
        `;
        return;
    }
    
    // Sort games by highest score
    const sortedGames = games
        .map(game => ({
            ...game,
            maxScore: Math.max(...game.players.map(p => p.score)),
            topPlayer: game.players.find(p => p.score === Math.max(...game.players.map(p => p.score)))
        }))
        .sort((a, b) => b.maxScore - a.maxScore)
        .slice(0, 10);

    sortedGames.forEach((game, index) => {
        const entry = document.createElement('div');
        entry.className = 'leaderboard-entry';
        
        const trophy = getTrophyIcon(index);
        const sourceIcon = source === 'global' ? '🌐' : '🏠';
        
        entry.innerHTML = `
            <div class="info">
                <span class="trophy">${trophy}</span>
                <div>
                    <div class="name">${game.topPlayer.name}</div>
                    <div class="character">${game.topPlayer.character}</div>
                    <div class="details">${game.questionCount} soru • ${sourceIcon}</div>
                </div>
            </div>
            <div class="points">${game.maxScore}</div>
        `;
        
        container.appendChild(entry);
    });
}

function renderWeeklyLeaderboard(games, source) {
    const container = document.getElementById('weekly-leaders');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (games.length === 0) {
        container.innerHTML = `
            <div class="leaderboard-entry">
                <div class="info">
                    <span class="trophy">🏆</span>
                    <span class="name">Bu hafta henüz oyun oynanmadı</span>
                </div>
            </div>
        `;
        return;
    }
    
    // Sort games by highest score
    const sortedGames = games
        .map(game => ({
            ...game,
            maxScore: Math.max(...game.players.map(p => p.score)),
            topPlayer: game.players.find(p => p.score === Math.max(...game.players.map(p => p.score)))
        }))
        .sort((a, b) => b.maxScore - a.maxScore)
        .slice(0, 20);

    sortedGames.forEach((game, index) => {
        const entry = document.createElement('div');
        entry.className = 'leaderboard-entry';
        
        const trophy = getTrophyIcon(index);
        const sourceIcon = source === 'global' ? '🌐' : '🏠';
        const gameDate = game.timestamp ? new Date(game.timestamp).toLocaleDateString('tr-TR') : '';
        
        entry.innerHTML = `
            <div class="info">
                <span class="trophy">${trophy}</span>
                <div>
                    <div class="name">${game.topPlayer.name}</div>
                    <div class="character">${game.topPlayer.character}</div>
                    <div class="details">${game.questionCount} soru • ${sourceIcon} ${gameDate ? '• ' + gameDate : ''}</div>
                </div>
            </div>
            <div class="points">${game.maxScore}</div>
        `;
        
        container.appendChild(entry);
    });
}

function getTrophyIcon(index) {
    switch (index) {
        case 0: return '🥇';
        case 1: return '🥈';
        case 2: return '🥉';
        default: return '🏆';
    }
}

// Export functions to global scope
window.saveToLeaderboard = saveToLeaderboard;
window.displayLeaderboard = displayLeaderboard;

console.log('🏆 Leaderboard system ready');