const wordCounts = {}; // Kelimelerin sayısını tutacak obje

document.getElementById('wordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const wordInput = document.getElementById('wordInput');
    const word = wordInput.value.trim().toLowerCase(); // Büyük/küçük harf duyarlılığını ortadan kaldır
    if(word) {
        wordCounts[word] = (wordCounts[word] || 0) + 1; // Kelimenin sayısını arttır veya 1 olarak ayarla
        updateWordList(); // Kelime listesini güncelle
        wordInput.value = ''; // Input alanını temizle
    }
});

function updateWordList() {
    const wordList = document.getElementById('wordList');
    wordList.innerHTML = ''; // Listeyi temizle ve yeniden oluştur

    Object.entries(wordCounts).sort((a, b) => b[1] - a[1]).forEach(([word, count]) => {
        const listItem = document.createElement('li');
        listItem.textContent = word;
        
        // Kelimenin tekrar sayısına göre font büyüklüğünü ayarla
        const fontSize = 16 + (count - 1) * 2; // Her ekstra tekrar için 2px ekle
        listItem.style.fontSize = `${fontSize}px`;
        
        wordList.appendChild(listItem);
    });
}