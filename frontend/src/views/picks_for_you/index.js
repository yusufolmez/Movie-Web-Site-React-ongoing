import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react'; // withAuthenticationRequired import edildi
import Loading from "../../components/Loading";
import './index.css';  // CSS dosyasını import ediyoruz

const MovieRecommendations = () => {
  const { user, isAuthenticated } = useAuth0(); // Auth0'dan kullanıcı bilgilerini alıyoruz
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [apiKey] = useState('1ac1c652640394393d245daab04c06b2');  // Buraya kendi API anahtarınızı ekleyin

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRecommendations(user.sub); // Eğer kullanıcı giriş yaptıysa, recommendations'ı alıyoruz
    }
  }, [isAuthenticated, user]); // isAuthenticated ve user değiştiğinde tekrar çalışacak

  const fetchRecommendations = async (userSub) => {
    try {
      const response = await axios.post('http://localhost:5001/recommendations/', {
        user_sub: userSub,
      });

      // TMDb API'sinden film bilgilerini almak
      const movieDetails = await Promise.all(
        response.data.map(async (movie) => {
          const movieResponse = await axios.get(
            `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${apiKey}&language=en-US`
          );
          return { ...movie, details: movieResponse.data };
        })
      );

      setRecommendations(movieDetails);
      setError('');
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Could not fetch recommendations. Please try again.');
    }
  };

  return (
    <div className="movie-recommendations-container">
      <h1>Sizin için seçtiklerimiz</h1>
      {error && <p className="error">{error}</p>}
      {recommendations.length > 0 && (
        <div className="movie-posters">
          {recommendations.map((movie) => (
            <div key={movie.id}>
              {movie.details.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.details.poster_path}`}
                  alt={movie.details.title}
                  className="movie-poster"
                />
              )}
              <div>
                <h2>{movie.details.title}</h2>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// `withAuthenticationRequired` ile MovieRecommendations bileşenini sarıyoruz
export default withAuthenticationRequired(MovieRecommendations, {
  onRedirecting: () => <Loading />, // Kullanıcıyı yönlendirirken Loading bileşeni gösterilecek
});
