import React, { useState, useEffect } from 'react';

const API_KEY = '1ac1c652640394393d245daab04c06b2'; // Buraya kendi API anahtarınızı koyun
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'; // Film posterlerini almak için

const GenreMovies = ({ genreId }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Genre ID'ye göre filmleri almak için API'ye istek gönderiyoruz
    const fetchMoviesByGenre = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=en-US`
        );
        const data = await response.json();
        
        // Verileri istediğiniz formata dönüştürme
        const formattedMovies = data.results.map((movie) => ({
          img: `${IMAGE_BASE_URL}${movie.poster_path}`, // Poster URL'si
          title: movie.title, // Film başlığı
          subtitle: movie.title, // Alt başlık olarak başlık kullanılabilir
          description: movie.overview, // Film açıklaması
          genreId: genreId // Genre ID
        }));

        setMovies(formattedMovies);

        // JSON formatında kaydetme işlemi
        const moviesJson = JSON.stringify(formattedMovies, null, 2);
        console.log(moviesJson); // JSON'u konsola yazdırıyoruz
      } catch (error) {
        console.error('Veri çekme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMoviesByGenre();
  }, [genreId]);

  if (loading) {
    return <div>Yükleniyor...</div>; // Yüklenme durumu
  }

  return (
    <div className="movie-list">
      {movies.length === 0 ? (
        <div>Bu kategori için film bulunamadı.</div>
      ) : (
        movies.map((movie, index) => (
          <div key={index} className="movie-item">
            <img
              src={movie.img} // Poster görselini almak
              alt={movie.title}
              style={{ width: '200px' }}
            />
            <h3>{movie.title}</h3>
            <p>{movie.description}</p>
            <p>Genre ID: {movie.genreId}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default GenreMovies;
