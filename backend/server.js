const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const app = express();  // This line was missing
const port = 5000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    console.log('Dosya yükleme isteği alındı:', req.body);
    const userSub = req.body.userSub || 'unknown';
    const fileExtension = path.extname(file.originalname);
    const fileName = `${userSub}${fileExtension}`;
    console.log('Oluşturulan dosya adı:', fileName);
    cb(null, fileName);
  }
});

const upload = multer({ storage: storage });

app.post('/api/upload-profile-picture', upload.single('profilePicture'), (req, res) => {
  console.log('Dosya yükleme isteği alındı:', req.body);
  try {
    if (!req.file) {
      console.error('Dosya yüklenemedi');
      return res.status(400).json({ error: 'Dosya yüklenemedi' });
    }

    const fileUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
    console.log('Dosya başarıyla yüklendi:', fileUrl);
    res.json({ fileUrl });
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    res.status(500).json({ error: error.message || 'Dosya yükleme sırasında bir hata oluştu' });
  }
});

app.put('/api/update-user/:userSub', async (req, res) => {
  const userSub = req.params.userSub;
  const { name, nickname, picture } = req.body;

  try {
    const token = await getManagementApiToken();
    const response = await fetch(`https://${AUTH0_DOMAIN}/api/v2/users/${userSub}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, nickname, picture })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Auth0 API Yanıtı:', errorData);
      throw new Error(errorData.message || 'Kullanıcı bilgilerini güncellemede hata oluştu');
    }

    const updatedUser = await response.json();
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Kullanıcı bilgilerini güncelleme hatası:', error);
    res.status(500).json({ error: error.message || 'Kullanıcı bilgilerini güncelleme hatası' });
  }
});

async function getManagementApiToken() {
  const tokenUrl = `https://${AUTH0_DOMAIN}/oauth/token`;
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      client_id: AUTH0_CLIENT_ID,
      client_secret: AUTH0_CLIENT_SECRET,
      audience: `https://${AUTH0_DOMAIN}/api/v2/`,
      grant_type: 'client_credentials'
    }),
  });

  const data = await response.json();
  return data.access_token;
}
// Profil resmi yükleme endpoint'i
app.post('/api/upload-profile-picture', upload.single('profilePicture'), (req, res) => {
  console.log('Dosya yükleme isteği alındı:', req.body);
  try {
    if (!req.file) {
      console.error('Dosya yüklenemedi');
      return res.status(400).json({ error: 'Dosya yüklenemedi' });
    }

    if (!req.body.userSub) {
      console.error('Kullanıcı sub değeri eksik');
      return res.status(400).json({ error: 'Kullanıcı sub değeri eksik' });
    }

    const fileUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
    console.log('Dosya başarıyla yüklendi:', fileUrl);
    res.json({ fileUrl });
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    res.status(500).json({ error: error.message || 'Dosya yükleme sırasında bir hata oluştu' });
  }
});
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
// Yorum ekleme API'si
app.post('/api/movies/comment', (req, res) => {
  const { movieId, userSub, username, commentText } = req.body;
  if (!movieId || !userSub || !username || !commentText) {
    return res.status(400).send('Geçersiz parametreler');
  }
  const query = `
    INSERT INTO movie_comments (movie_id, user_sub, username, comment_text)
    VALUES (?, ?, ?, ?);
  `;
  db.query(query, [movieId, userSub, username, commentText], (err, result) => {
    if (err) {
      console.error('Yorum ekleme hatası: ', err);
      return res.status(500).send('Bir hata oluştu');
    }
    res.status(201).json({ message: 'Yorum başarıyla eklendi', commentId: result.insertId });
  });
});
// Film yorumlarını getirme API'si
app.get('/api/movies/comments/:movieId', (req, res) => {
  const movieId = req.params.movieId;
  const query = `
    SELECT id, user_sub, username, comment_text, created_at
    FROM movie_comments
    WHERE movie_id = ?
    ORDER BY created_at DESC;
  `;
  db.query(query, [movieId], (err, results) => {
    if (err) {
      console.error('Yorumları getirme hatası: ', err);
      return res.status(500).send('Bir hata oluştu');
    }
    res.status(200).json(results);
  });
});

// Auth0 Management API için gerekli bilgiler
const AUTH0_DOMAIN = 'dev-0heodmlvib5a3k7x.us.auth0.com';
const AUTH0_CLIENT_ID = 'Czrhjk2FM9ClLg6CFz42jyK6S2yrCmVh';
const AUTH0_CLIENT_SECRET = 'RjtymPSjVALPjaZWsVkGcZXFq0taBJipBtFMZJh2q306X2sRihqTuTgSA5G2aakg';
const AUTH0_AUDIENCE = `https://${AUTH0_DOMAIN}/api/v2/`;



// Diğer kullanıcıları getirme endpoint'i 
app.get('/api/users', async (req, res) => {
  try {
    const token = await getManagementApiToken();
    const usersResponse = await fetch(`${AUTH0_AUDIENCE}users`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const users = await usersResponse.json();
    const simplifiedUsers = users.map(user => ({
      id: user.user_id,
      name: user.name,
      picture: user.picture,
      nickname: user.nickname
    }));

    res.json(simplifiedUsers);
  } catch (error) {
    console.error('Kullanıcıları getirme hatası:', error);
    res.status(500).json({ error: 'Kullanıcıları getirme hatası' });
  }
});

// Arkadaş ekleme API'si
app.post('/api/add-friend', (req, res) => {
  const { userSub, friendSub } = req.body;

  if (!userSub || !friendSub) {
    return res.status(400).send('Geçersiz parametreler');
  }

  const query = `
    INSERT INTO user_friends (user_sub, friend_sub)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE status = 'pending';
  `;

  db.query(query, [userSub, friendSub], (err, result) => {
    if (err) {
      console.error('Arkadaş ekleme hatası: ', err);
      return res.status(500).send('Bir hata oluştu');
    }

    res.status(201).json({ message: 'Arkadaşlık isteği gönderildi' });
  });
});

// Arkadaşlık durumunu güncelleme API'si
app.put('/api/update-friendship', (req, res) => {
  const { userSub, friendSub, status } = req.body;

  if (!userSub || !friendSub || !status) {
    return res.status(400).send('Geçersiz parametreler');
  }

  const query = `
    UPDATE user_friends
    SET status = ?
    WHERE (user_sub = ? AND friend_sub = ?) OR (user_sub = ? AND friend_sub = ?);
  `;

  db.query(query, [status, userSub, friendSub, friendSub, userSub], (err, result) => {
    if (err) {
      console.error('Arkadaşlık durumu güncelleme hatası: ', err);
      return res.status(500).send('Bir hata oluştu');
    }

    res.status(200).json({ message: 'Arkadaşlık durumu güncellendi' });
  });
});

// Arkadaş listesini getirme API'si
app.get('/api/friends/:userSub', async (req, res) => {
  const userSub = req.params.userSub;

  const query = `
    SELECT DISTINCT
      CASE
        WHEN user_sub = ? THEN friend_sub
        ELSE user_sub
      END AS friend_sub
    FROM user_friends
    WHERE (user_sub = ? OR friend_sub = ?) AND status = 'accepted';
  `;

  db.query(query, [userSub, userSub, userSub], async (err, results) => {
    if (err) {
      console.error('Arkadaş listesi getirme hatası: ', err);
      return res.status(500).send('Bir hata oluştu');
    }

    try {
      const token = await getManagementApiToken();
      const enrichedResults = await Promise.all(results.map(async (friend) => {
        const userResponse = await fetch(`${AUTH0_AUDIENCE}users/${friend.friend_sub}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const userData = await userResponse.json();
        return {
          id: friend.friend_sub,
          name: userData.name,
          picture: userData.picture,
          nickname: userData.nickname
        };
      }));

      res.status(200).json(enrichedResults);
    } catch (error) {
      console.error('Kullanıcı bilgilerini getirme hatası:', error);
      res.status(500).json({ error: 'Kullanıcı bilgilerini getirme hatası' });
    }
  });
});

// Arkadaşlık isteklerini getirme API'si
app.get('/api/friend-requests/:userSub', async (req, res) => {
  const userSub = req.params.userSub;

  const query = `
    SELECT *
    FROM user_friends
    WHERE friend_sub = ? AND status = 'pending';
  `;

  db.query(query, [userSub], async (err, results) => {
    if (err) {
      console.error('Arkadaşlık isteklerini getirme hatası: ', err);
      return res.status(500).send('Bir hata oluştu');
    }

    try {
      const token = await getManagementApiToken();
      const enrichedResults = await Promise.all(results.map(async (request) => {
        const userResponse = await fetch(`${AUTH0_AUDIENCE}users/${request.user_sub}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const userData = await userResponse.json();
        return {
          ...request,
          name: userData.name,
          picture: userData.picture
        };
      }));

      res.status(200).json(enrichedResults);
    } catch (error) {
      console.error('Kullanıcı bilgilerini getirme hatası:', error);
      res.status(500).json({ error: 'Kullanıcı bilgilerini getirme hatası' });
    }
  });
});

// Kullanıcı bilgilerini userSub üzerinden getirme API'si
app.get('/api/user-info/:userSub', async (req, res) => {
  const userSub = req.params.userSub;

  try {
    // Auth0 Management API Token al
    const token = await getManagementApiToken();

    // Auth0 Management API'ye kullanıcı bilgisi için istek yap
    const userResponse = await fetch(`${AUTH0_AUDIENCE}users/${userSub}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!userResponse.ok) {
      return res.status(userResponse.status).json({ error: 'Kullanıcı bilgileri alınamadı' });
    }

    const userData = await userResponse.json();

    // Kullanıcı bilgilerini döndür
    res.status(200).json({
      id: userData.user_id,
      name: userData.name,
      picture: userData.picture,
      email: userData.email,
      nickname: userData.nickname
    });
  } catch (error) {
    console.error('Kullanıcı bilgilerini getirme hatası:', error);
    res.status(500).json({ error: 'Kullanıcı bilgilerini getirme sırasında bir hata oluştu' });
  }
});


// Profil resmi yükleme endpoint'i
app.post('/api/upload-profile-picture', upload.single('profilePicture'), async (req, res) => {
  try {
    console.log('Received file upload request');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'Dosya yüklenemedi' });
    }

    if (!req.body.userSub) {
      console.error('User sub is missing');
      return res.status(400).json({ error: 'User sub is missing' });
    }

    const fileUrl = `http://localhost:${port}/uploads/${req.file.filename}`;
    console.log('File uploaded successfully:', fileUrl);
    res.json({ fileUrl });
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    res.status(500).json({ error: error.message || 'Dosya yükleme sırasında bir hata oluştu' });
  }
});

// Kullanıcı bilgilerini güncelleme API'si
app.put('/api/update-user/:userSub', async (req, res) => {
  const userSub = req.params.userSub;
  const { name, nickname, picture } = req.body;

  try {
    console.log('Received user update request for:', userSub);
    console.log('Update data:', { name, nickname, picture });

    const token = await getManagementApiToken();
    console.log('Management API Token:', token);

    const response = await fetch(`${AUTH0_AUDIENCE}users/${userSub}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, nickname, picture })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Auth0 API Yanıtı:', errorData);
      throw new Error(errorData.message || 'Kullanıcı bilgilerini güncellemede hata oluştu');
    }

    const updatedUser = await response.json();
    console.log('User updated successfully:', updatedUser);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Kullanıcı bilgilerini güncelleme hatası:', error);
    res.status(500).json({ error: error.message || 'Kullanıcı bilgilerini güncelleme hatası' });
  }
});

// Kullanıcı bilgilerini nickname üzerinden getirme API'si
app.get('/api/user/by-nickname/:nickname', async (req, res) => {
  const nickname = req.params.nickname;
  try {
    const token = await getManagementApiToken();
    const response = await fetch(`${AUTH0_AUDIENCE}users`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Auth0 API yanıt vermedi');
    }

    const users = await response.json();
    const user = users.find(u => u.nickname === nickname);

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Kullanıcı profili getirme hatası:', error);
    res.status(500).json({ error: 'Kullanıcı profili alınamadı' });
  }
});


// Auth0 Management API için token alma fonksiyonu
async function getManagementApiToken() {
  try {
    const tokenResponse = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        client_id: AUTH0_CLIENT_ID,
        client_secret: AUTH0_CLIENT_SECRET,
        audience: AUTH0_AUDIENCE,
        grant_type: 'client_credentials'
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to obtain Management API token');
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
  } catch (error) {
    console.error('Error obtaining Management API token:', error);
    throw error;
  }
}

// Global hata yakalayıcı
app.use((err, req, res, next) => {
  console.error('Sunucu hatası:', err);
  res.status(500).json({ error: 'Sunucuda bir hata oluştu', details: err.message });
});
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor`);
});

