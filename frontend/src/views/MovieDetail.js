import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const MovieDetail = () => {
  const { title } = useParams(); // URL'den başlığı al
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true); // Yüklenme durumu için state

  useEffect(() => {
    const fetchMovieDetails = async () => {
      const formattedTitle = title.replace(/-/g, ' '); // URL formatından başlığı geri al
      console.log("Alınan Film Başlığı:", formattedTitle); // Burada kontrol et
      try {
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=1ac1c652640394393d245daab04c06b2&query=${encodeURIComponent(formattedTitle)}`);
        if (!response.ok) {
          throw new Error("Ağ isteği başarısız oldu");
        }
        const data = await response.json();
        setMovie(data.results[0]); // İlk sonucu al
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false); // Yükleme işlemi tamamlandı
      }
    };

    fetchMovieDetails();
  }, [title]);

  if (loading) return <div>Yükleniyor...</div>; // Yükleniyor durumu
  if (!movie) return <div>Film bilgisi bulunamadı.</div>; // Eğer film yoksa mesaj göster

  return (
    <div className="movie-detail"> {/* CSS sınıfını ekleyin */}
      <h1>{movie.title}</h1>
      <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
      <p>{movie.overview}</p>
      <p>Yayın Tarihi: {movie.release_date}</p>
      {/* Diğer bilgiler buraya eklenebilir */}
    </div>
  );
};

export default MovieDetail;
