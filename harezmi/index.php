<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Responsive Gallery with Validation</title>
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/5.1.3/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
        }
        .button-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background-color: #ffc107; /* Sarı arka plan */
        }
        .image-row {
            height: calc(100vh - 40px); /* Buton satırının yüksekliğini çıkar */
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden; /* Prevent scrollbars */
        }
        .gallery-image {
            transition: transform 0.5s ease;
            max-height: 100%;
            max-width: 100%;
        }
        .image-row:hover .gallery-image {
            transform: scale(1.5); /* Zoom effect on hover */
        }
        .image-info {
            margin: 0 20px; /* Resim bilgisi için sağlı sollu boşluk */
        }
        .like-button {
            background: none;
            border: none;
            cursor: pointer;
        }
        .liked {
            color: red;
        }
    </style>
</head>
<body>

<div id="loginSection">
    <div class="container">
        <h2>TC Kimlik No Doğrulama</h2>
        <input type="text" id="tcInput" placeholder="TC Kimlik Numaranızı Giriniz">
        <button onclick="validateTC()">Giriş Yap</button>
    </div>
</div>

<div id="gallerySection" style="display:none;">
    <div class="button-row">
        <button id="prevBtn" class="btn btn-outline-dark">Önceki</button>
        <span id="imageInfo" class="image-info">Masa 1</span>
        <button id="likeBtn" class="btn btn-outline-danger like-button">❤️ <span id="likeCount">0</span></button>
        <button id="nextBtn" class="btn btn-outline-dark">Sonraki</button>
    </div>
    <div class="image-row">
        <img id="galleryImage" src="masa1_1.jpg" alt="Masa Resmi" class="gallery-image">
    </div>
</div>

<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script>
    const validTCNumbers = [
        "10529292336", "10651231302", "11995642366", "12805581998", "13310560560",
        "13346562606", "13984724930", "14747512214", "14797986898", "14972759262",
        "15986470112", "16259476268", "16420498600", "17996476818", "18253198726",
        "18937589628", "19460802864", "19691093222", "19867601558", "20279384106",
        "21374306130", "21566285106", "21752050822", "22169187736", "22358187400",
        "22778323228", "23186339498", "25376214370", "25394213706", "26060168986",
        "26248603674", "29362055282", "31087819568", "33454731572", "34133001566",
        "34961049310", "35792021414", "37195856150", "37663958850", "38845747804",
        "39097161196", "39916884626", "43291161074", "45181581542", "45418339984",
        "45541953040", "47134148192", "48250038572", "48616758274", "51250609604",
        "52327359736", "53167699624", "53563575874", "55546589816", "56761558700",
        "57157471344", "60199464076", "63745090330", "66316259570", "72082038820"
    ];

    let currentIndex = 0;
    const images = [
        { name: "Masa 1", src: "masa1_1.jpg", likes: 0, userLiked: false },
        { name: "Masa 2", src: "masa1_2.jpg", likes: 0, userLiked: false },
        { name: "Masa 3", src: "masa1_3.jpg", likes: 0, userLiked: false },
        { name: "Masa 4", src: "masa1_4.jpg", likes: 0, userLiked: false },
        { name: "Masa 5", src: "masa1_5.jpg", likes: 0, userLiked: false },
        { name: "Masa 6", src: "masa1_6.jpg", likes: 0, userLiked: false },
        { name: "Masa 7", src: "masa1_7.jpg", likes: 0, userLiked: false },
        { name: "Masa 8", src: "masa1_8.jpg", likes: 0, userLiked: false },
        { name: "Masa 9", src: "masa2_1.jpg", likes: 0, userLiked: false },
        { name: "Masa 10", src: "masa2_2.jpg", likes: 0, userLiked: false },
        { name: "Masa 11", src: "masa2_3.jpg", likes: 0, userLiked: false },
        { name: "Masa 12", src: "masa2_4.jpg", likes: 0, userLiked: false },
        { name: "Masa 13", src: "masa2_5.jpg", likes: 0, userLiked: false },
        { name: "Masa 14", src: "masa2_6.jpg", likes: 0, userLiked: false },
        { name: "Masa 15", src: "masa2_7.jpg", likes: 0, userLiked: false },
        { name: "Masa 16", src: "masa2_8.jpg", likes: 0, userLiked: false }
    ];

    function validateTC() {
        const tcInput = document.getElementById('tcInput').value;
        if (validTCNumbers.includes(tcInput)) {
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('gallerySection').style.display = 'block';
        } else {
            alert('Geçersiz TC Kimlik Numarası.');
        }
    }

    function updateGallery(index) {
        const image = images[index];
        $("#galleryImage").attr("src", image.src);
        $("#imageInfo").text(image.name);
        $("#likeCount").text(image.likes);
        image.userLiked ? $("#likeBtn").addClass("liked") : $("#likeBtn").removeClass("liked");
    }

    $("#prevBtn").click(function() {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
        updateGallery(currentIndex);
    });

    $("#nextBtn").click(function() {
        currentIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
        updateGallery(currentIndex);
    });

    $("#likeBtn").click(function() {
        const image = images[currentIndex];
        if (!image.userLiked) {
            image.likes++;
            image.userLiked = true;
            <?php
$servername = "sql11.freesqldatabase.com";
$database = "sql11686155";
$username = "sql11686155";
$password = "JNi7czfcJW";

// Create connection

$conn = mysqli_connect($servername, $username, $password, $database);

// Check connection

if (!$conn) {
      die("Connection failed: " . mysqli_connect_error());
}

//echo "Connected successfully";

$sql = "INSERT INTO deneme (id, isim, adet) VALUES ('1', '1', '1')";
if (mysqli_query($conn, $sql)) {
      echo "New record created successfully";
} else {
      echo "Error: ");
}
mysqli_close($conn);

?>
        } else {
            image.likes--;
            image.userLiked = false;
        }
        updateGallery(currentIndex);
    });

    updateGallery(currentIndex); // Initialize gallery with the first image
</script>

</body>
</html>
