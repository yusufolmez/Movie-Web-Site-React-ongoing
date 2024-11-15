import React, { useEffect, useState } from 'react';
import { useTheme } from "../context/ThemeContext";

const MovieList = ({ selectedGenreId }) => {
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { theme } = useTheme();

  useEffect(() => {
    // Eğer genre değişirse, sayfayı sıfırla
    setCurrentPage(1);
    // Yeni genre ile filmleri getir
    if (!selectedGenreId) {
      fetchAllMovies();
    } else {
      fetchMoviesByGenre(selectedGenreId);
    }
  }, [selectedGenreId]);

  useEffect(() => {
    // Sayfa değiştiğinde filmleri güncelle
    if (!selectedGenreId) {
      fetchAllMovies();
    } else {
      fetchMoviesByGenre(selectedGenreId);
    }
  }, [currentPage, selectedGenreId]);

  const fetchAllMovies = async () => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=1ac1c652640394393d245daab04c06b2&page=${currentPage}`);
      if (!response.ok) {
        throw new Error("Ağ isteği başarısız oldu");
      }
      const data = await response.json();
      setMovies(data.results);
      setTotalPages(Math.min(data.total_pages, 100)); // Toplam sayfa sayısını 100 ile sınırla
    } catch (error) {
      console.error("Error fetching all movies:", error);
    }
  };

  const fetchMoviesByGenre = async (genreId) => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=1ac1c652640394393d245daab04c06b2&with_genres=${genreId}&page=${currentPage}`);
      if (!response.ok) {
        throw new Error("Ağ isteği başarısız oldu");
      }
      const data = await response.json();
      setMovies(data.results);
      setTotalPages(Math.min(data.total_pages, 100)); // Toplam sayfa sayısını 100 ile sınırla
    } catch (error) {
      console.error("Error fetching movies by genre:", error);
    }
  };

  const handlePosterClick = (title) => {
    const formattedTitle = title.replace(/\s+/g, '-'); // Boşlukları "-" ile değiştir
    window.open(`/movie/${formattedTitle}`, '_blank'); // Yeni sekmede aç
    console.log("Clicked Movie Title for URL:", title); // Tıklanan başlık
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className={`movie-list ${theme}`}>
      <div className="movie-posters ">
        {movies.map(movie => (
          <div key={movie.id} className={`movie-item ${theme}`}>
            <img 
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
              alt={movie.title} 
              onClick={() => handlePosterClick(movie.title)} // Tıklandığında fonksiyonu çağır
            />
            <h2  className={`${theme === 'dark' ? 'text-light' : 'text-dark'}`}>{movie.title}</h2>
          </div>
        ))}
      </div>

      {/* Sayfa Kontrolleri */}
      <div className="pagination">
        <button onClick={goToPreviousPage} disabled={currentPage === 1}>Önceki</button>
        <span>{currentPage} / {totalPages}</span>
        <button onClick={goToNextPage} disabled={currentPage === totalPages}>Sonraki</button>
      </div>
    </div>
  );
};

export default MovieList;
