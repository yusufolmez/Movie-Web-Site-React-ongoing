import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from "../../context/ThemeContext";
import '../../index.css';
import { useAuth0 } from "@auth0/auth0-react";import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons'; // Dolgun kalp
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons'; // Boş kalp


const MovieList = ({ selectedGenreId }) => {
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { theme } = useTheme();
  const movieListRef = useRef(null);
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const userSub = user?.sub;  // Auth0'dan alınacak kullanıcı kimliği

  // Her film için beğenme durumunu tutmak için bir state ekliyoruz
  const [likedMovies, setLikedMovies] = useState({});

  useEffect(() => {
    setCurrentPage(1);
    if (!selectedGenreId) {
      fetchAllMovies();
    } else {
      fetchMoviesByGenre(selectedGenreId);
    }

    if (isAuthenticated && userSub) {
      // Kullanıcı giriş yapmışsa, beğenilen filmleri veritabanından alalım
      fetchLikedMovies(userSub);
    }
  }, [selectedGenreId, isAuthenticated, userSub]);

  useEffect(() => {
    if (!selectedGenreId) {
      fetchAllMovies();
    } else {
      fetchMoviesByGenre(selectedGenreId);
    }

    // Sayfa değişiminde kaydırma işlemi
    if (movieListRef.current) {
      movieListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      setTotalPages(Math.min(data.total_pages, 100));
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
      setTotalPages(Math.min(data.total_pages, 100));
    } catch (error) {
      console.error("Error fetching movies by genre:", error);
    }
  };

  const fetchLikedMovies = async (userSub) => {
    try {
      const response = await fetch(`http://localhost:5000/api/movies/liked/${userSub}`);
      if (!response.ok) {
        throw new Error("Beğenilen filmler alınamadı");
      }
  
      const data = await response.json();
      const likedMoviesState = {};
  
      // Veriyi güncellerken, 'is_liked' değerini 1 => true, 0 => false olarak değiştiriyoruz.
      data.forEach(movie => {
        likedMoviesState[movie.movie_id] = movie.is_liked === 1;
      });
  
      setLikedMovies(likedMoviesState);
      console.log("Beğenilen Filmler State'i:", likedMoviesState);
  
    } catch (error) {
      console.error("Error fetching liked movies:", error);
    }
  };

  const handlePosterClick = (title) => {
    const formattedTitle = title.replace(/\s+/g, '-');
    window.open(`/movie/${formattedTitle}`, '_blank');
    console.log("Clicked Movie Title for URL:", title);
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

  const handleLike = async (movieId) => {
    const isLiked = likedMovies[movieId] || false; // Filmin mevcut beğenme durumu
    const newLikedMovies = { ...likedMovies, [movieId]: !isLiked }; // Yeni beğenme durumu

    // Kullanıcı beğeniyi tersine çevirecekse backend'e durumu bildireceğiz
    try {
      const response = await fetch("http://localhost:5000/api/movies/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId,
          userSub,
          isLiked: !isLiked, // Yeni beğeni durumu
        }),
      });

      if (!response.ok) {
        throw new Error(`Film beğenme isteği başarısız oldu: ${response.status}`);
      }

      const result = await response.json();
      console.log("Film başarıyla beğenildi:", result);

      setLikedMovies(newLikedMovies); // Beğeni durumu güncelle
    } catch (error) {
      console.error("Error liking movie:", error);
    }
  };

  return (
    <div className={`movie-list ${theme}`}>
      <div ref={movieListRef}></div>
      
      <div className="movie-posters">
        {movies.map(movie => (
          <div key={movie.id} className={`movie-item ${theme}`}>
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              onClick={() => handlePosterClick(movie.title)}
            />
            <div className='ttl-btn'>
            <h2 className={`${theme === 'dark' ? 'text-light' : 'text-dark'}`}>{movie.title}</h2>
            {/* Beğen Butonu */}
            {isAuthenticated && (
              <button 
                className="like-button"
                onClick={() => handleLike(movie.id)}
              >
                <FontAwesomeIcon 
                  icon={likedMovies[movie.id] ? solidHeart : regularHeart} 
                  style={{ color: likedMovies[movie.id] ? 'red' : 'gray', fontSize: '1.5rem' }}
                />
              </button>

            )}
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button onClick={goToPreviousPage} disabled={currentPage === 1}>Önceki</button>
        <span>{currentPage} / {totalPages}</span>
        <button onClick={goToNextPage} disabled={currentPage === totalPages}>Sonraki</button>
      </div>
    </div>
  );
};

export default MovieList;
