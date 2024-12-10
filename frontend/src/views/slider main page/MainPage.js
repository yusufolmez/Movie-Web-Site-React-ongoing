import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from "../../context/ThemeContext";
import '../../index.css';
import { useAuth0 } from "@auth0/auth0-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import jsonData from '../../assets/popular_movies.json'

const MainPage = () => {
  const [itemActive, setItemActive] = useState(0);
  const [selectedGenreId, setSelectedGenreId] = useState(null);
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { theme } = useTheme();
  const movieListRef = useRef(null);
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const userSub = user?.sub;
  const [likedMovies, setLikedMovies] = useState({});

  // Slider data
  const items =jsonData;
  
  // Fetch movies
  const fetchAllMovies = async () => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=1ac1c652640394393d245daab04c06b2&page=${currentPage}`);
      if (!response.ok) throw new Error("Failed to fetch movies");
      const data = await response.json();
      setMovies(data.results);
      setTotalPages(Math.min(data.total_pages, 100));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchMoviesByGenre = async (genreId) => {
    try {
      const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=1ac1c652640394393d245daab04c06b2&with_genres=${genreId}&page=${currentPage}`);
      if (!response.ok) throw new Error("Failed to fetch movies");
      const data = await response.json();
      setMovies(data.results);
      setTotalPages(Math.min(data.total_pages, 100));
    } catch (error) {
      console.error(error);
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
  
    } catch (error) {
      console.error("Error fetching liked movies:", error);
    }
  };

  // Handle like action
  const handleLike = async (movieId) => {
    const isLiked = likedMovies[movieId] || false;
    const newLikedMovies = { ...likedMovies, [movieId]: !isLiked };

    try {
      const response = await fetch("http://localhost:5000/api/movies/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, userSub, isLiked: !isLiked })
      });

      if (!response.ok) throw new Error("Failed to update like status");
      setLikedMovies(newLikedMovies);
    } catch (error) {
      console.error(error);
    }
  };

  // Handle poster click
  const handlePosterClick = (title) => {
    const formattedTitle = encodeURIComponent(title.trim().replace(/\s+/g, '-'));
    window.open(`/movie/${formattedTitle}`); // Aynı sekmede açmak için '_self' kullanabilirsiniz
  };

  // Combined useEffect
  useEffect(() => {
    if (!selectedGenreId) fetchAllMovies();
    else fetchMoviesByGenre(selectedGenreId);

    if (movieListRef.current) {
      movieListRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentPage, selectedGenreId]);
  
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

  // Render
  return (
    <div  ref={movieListRef}>
      {/* Slider Section */}
      <div className="slider">
        <div className="list">
          {items.filter(item => !selectedGenreId || item.genreId === selectedGenreId).map((item, index) => (
            <div key={index} className={`item ${index === itemActive ? "active" : ""}`}>
              <img src={item.img} alt="slider-img" />
              <div className="content">
                <p>{item.subtitle}</p>
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="thumbnail">
          {items.map((item, index) => (
            <div key={index} className={`slide ${item.genreId === selectedGenreId ? "active" : ""}`} onClick={() => setSelectedGenreId(item.genreId)}>
              <img src={item.img} alt="thumbnail" />
              <div className="content">{item.title}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Movie List Section */}
      <div className={`movie-list`}>
        <div className="movie-posters">
          {movies.map(movie => (
            <div key={movie.id} className={`movie-item`}>
              <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} onClick={() => handlePosterClick(movie.title)} />
              
              {isAuthenticated && (
                <button className="like-button" onClick={() => handleLike(movie.id)}>
                  <FontAwesomeIcon icon={likedMovies[movie.id] ? solidHeart : regularHeart} style={{ color: likedMovies[movie.id] ? 'red' : 'gray', fontSize: '1.5rem' }} />
                </button>
              )}
                <h2>{movie.title}</h2>
            </div>
          ))}
        </div>
        <div className="pagination">
          <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Önceki</button>
          <span>{currentPage} / {totalPages}</span>
          <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Sonraki</button>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
