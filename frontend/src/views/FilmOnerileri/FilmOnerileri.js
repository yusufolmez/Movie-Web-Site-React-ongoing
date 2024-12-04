import React, { useState, useEffect } from 'react'; 

import axios from 'axios';
import '../../index.css';
import { useAuth0 } from "@auth0/auth0-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';

import '../../index.css';
const FilmRecommender = () => {
  
  const [itemActive, setItemActive] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  
  const apiKey = '1ac1c652640394393d245daab04c06b2';  // TMDb API key from environment variables

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };
  
  const handlePosterClick = (title) => {
    if (!title) {
      console.error("Title is undefined or null.");
      return;
    }
    const formattedTitle = encodeURIComponent(title.trim().replace(/\s+/g, '-'));
    window.open(`/movie/${formattedTitle}`);
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

      // Fetch backdrops for the recommended films
      const filmsWithBackdrops = await Promise.all(
        recommendedFilms.map(async (film) => {
          const movieId = film.id;
          const tmdbResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&language=en-US`
          );
          const backdropPath = tmdbResponse.data.backdrop_path;
          const backdropUrl = backdropPath
            ? `https://image.tmdb.org/t/p/w1280${backdropPath}` 
            : null;

          return {
            ...film,
            backdropUrl,
          };
        })
      );

      setRecommendations(filmsWithBackdrops);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch recommendations. Please try again later.');
    }
  };

  // Change slide based on thumbnail click
  const onThumbnailClick = (index) => {
    setItemActive(index);
  };

  return (
    <div>
      <div className="slider-recommend">
        {/* List of Items */}
        <div className="list">
          {recommendations.map((film, index) => (
            <div className={`item ${itemActive === index ? 'active' : ''}`} key={index}>
              <img src={film.backdropUrl} alt="slider-img"/>
              <div className="content">
                <p>{film.title}</p>
                <h2   onClick={() => handlePosterClick(film.film)}>{film.film}</h2>
                <p>{film.overview}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Thumbnails */}
        <div className="thumbnail-recommend">
        <div className='input'>
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
      </div>
          {recommendations.map((film, index) => (
            
            <div
              className={`slide ${itemActive === index ? 'active' : ''}`}
              key={index}
              onClick={() => onThumbnailClick(index)}
            >
              <img src={film.backdropUrl} alt="thumbnail"/>
              <div className="content">{film.title}</div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default FilmRecommender;
