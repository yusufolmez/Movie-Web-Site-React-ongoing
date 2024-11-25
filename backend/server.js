const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());

// MySQL bağlantısı
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Yusuf.6707',
  database: 'movie_like',
});

db.connect((err) => {
  if (err) {
    console.error('Veritabanı bağlantısı hatası: ', err);
    return;
  }
  console.log('MySQL veritabanına bağlanıldı.');
});

app.use(express.json()); // JSON gövde verisini işleyebilmek için

// Film beğenme API'si
app.post('/api/movies/like', (req, res) => {
  const { movieId, userSub, isLiked } = req.body;

  if (!movieId || !userSub || typeof isLiked !== 'boolean') {
    return res.status(400).send('Geçersiz parametreler');
  }

  // Kullanıcı ve film arasında beğenme durumunu güncelleme veya ekleme
  const query = `
    INSERT INTO user_liked_movies (user_sub, movie_id, is_liked)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE is_liked = ?;
  `;

  db.query(query, [userSub, movieId, isLiked, isLiked], (err, result) => {
    if (err) {
      console.error('Film beğenme veritabanı hatası: ', err);
      return res.status(500).send('Bir hata oluştu');
    }

    res.status(200).json({ message: 'Film başarıyla beğenildi', result });
  });
});

// Kullanıcının beğendiği filmleri getirme API'si
app.get('/api/movies/liked/:userSub', (req, res) => {
  const userSub = req.params.userSub;

  // Beğenilen filmleri al
  const query = `
    SELECT movie_id, is_liked
    FROM user_liked_movies
    WHERE user_sub = ? AND is_liked = 1;
  `;

  db.query(query, [userSub], (err, results) => {
    if (err) {
      console.error('Beğenilen filmleri getirme hatası: ', err);
      return res.status(500).send('Bir hata oluştu');
    }

    // Kullanıcının beğendiği filmleri döndür
    res.status(200).json(results);
  });
});

app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor`);
});
