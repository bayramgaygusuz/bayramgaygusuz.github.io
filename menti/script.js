document.getElementById('wordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const wordInput = document.getElementById('wordInput');
    const word = wordInput.value.trim();
    
    if(word) {
        const listItem = document.createElement('li');
        listItem.textContent = word;
        document.getElementById('wordList').appendChild(listItem);
        wordInput.value = ''; // Input alanını temizle
    }
});