
import React, { useState, useEffect } from 'react'; // useEffect burada eklenmeli

import axios from 'axios';
import '../../index.css';
import { useAuth0 } from "@auth0/auth0-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';

const FilmRecommender = () => {
  const [userInput, setUserInput] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const userSub = user?.sub;
  const [likedMovies, setLikedMovies] = useState({});
  const apiKey = '1ac1c652640394393d245daab04c06b2';  // TMDb API key from environment variables

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const getRecommendations = async () => {
    if (!userInput.trim()) {
      setError('Please enter a valid input.');
      return;
    }
    setError('');
    try {
      const response = await axios.post('http://localhost:8080/recommend', {
        input: userInput,
      });
      const recommendedFilms = response.data.results;

      // Fetch posters for the recommended films
      const filmsWithPosters = await Promise.all(
        recommendedFilms.map(async (film) => {
          const movieId = film.id;
          const tmdbResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`
          );
          const posterPath = tmdbResponse.data.poster_path;
          const posterUrl = posterPath
            ? `https://image.tmdb.org/t/p/w500${posterPath}`
            : null;

          return {
            ...film,
            posterUrl,
          };
        })
      );

      setRecommendations(filmsWithPosters);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch recommendations. Please try again later.');
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
      const formattedTitle = title.replace(/\s+/g, '-');
      window.open(`/movie/${formattedTitle}`, '_blank');
    };

    useEffect(() => {
      
      // Eğer kullanıcı giriş yaptıysa ve kullanıcı bilgisi varsa
      if (isAuthenticated && userSub) {
        // Kullanıcının beğenilen filmleri veritabanından al
        fetchLikedMovies(userSub);
      } else {

      }
    }, [isAuthenticated, userSub]); // Bağımlılıkları isAuthenticated ve userSub'a göre güncelledik
    

  return (
    <div className="film-recommender-container">
      <h1 className="recommendation-header">Film Recommendation System</h1>
      <input
        type="text"
        placeholder="Enter a brief description..."
        value={userInput}
        onChange={handleInputChange}
        className="input-field"
      />
      <br />
      <button
        onClick={getRecommendations}
        className="recommend-button"
      >
        Get Recommendations
      </button>
      {error && <p className="error-message">{error}</p>}
 



      <div className="movie-list">
  {/* API'den alınan veriler varsa */}
  {recommendations.length > 0 && (
    <div className="movie-posters">
      {/* Önerilen filmleri listele */}
      {recommendations.map((rec, index) => (
        <div key={index} className="movie-item">
          {/* Poster varsa göster */}
          {rec.posterUrl && (
            <img
              src={rec.posterUrl}
              alt={rec.title}
              onClick={() => handlePosterClick(rec.title)} // Poster tıklama işlevi
            />
          )}
          
          {/* Beğenme butonu, giriş yapıldıysa göster */}
          {isAuthenticated && (
            <button className="like-button" onClick={() => handleLike(rec.id)}>
              <FontAwesomeIcon 
                icon={likedMovies[rec.id] ? solidHeart : regularHeart} 
                style={{ color: likedMovies[rec.id] ? 'red' : 'gray', fontSize: '1.5rem' }} 
              />
            </button>
          )}
          
          {/* Film başlığını göster */}
          <h2>{rec.title}</h2>
        </div>
      ))}
    </div>
  )}
</div>






    </div>
  );
};

export default FilmRecommender;
