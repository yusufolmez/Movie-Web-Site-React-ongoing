import React, { useState, useEffect } from 'react';
import Loading from "../../components/Loading";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import './styles.css';

const TMDB_API_KEY = '1ac1c652640394393d245daab04c06b2';

function FilmOnerileri() {
  const { isAuthenticated, logout, user } = useAuth0();
  const [userInput, setUserInput] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const getRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8080/film-onerisi/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ kullanici_girisi: userInput, oneri_sayisi: 5 }),
      });

      if (!response.ok) {
        throw new Error('Sunucu yanıtı düzgün değil');
      }

      const data = await response.json();
      const moviesWithTMDBInfo = await Promise.all(
        data.oneriler.map(async (movie) => {
          const tmdbInfo = await fetchTMDBInfo(movie.baslik);
          const keywords = await fetchKeywords(movie.id);
          return { ...movie, ...tmdbInfo, keyword: keywords };
        })
      );
      setRecommendations(moviesWithTMDBInfo);
    } catch (error) {
      setError('Öneriler alınırken bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTMDBInfo = async (title) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`
      );

      if (!response.ok) {
        throw new Error('TMDB sunucusu yanıt vermedi');
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return {
          poster_path: data.results[0].poster_path,
          tmdb_id: data.results[0].id,
          ozet: data.results[0].overview,
        };
      }
    } catch (error) {
      console.error('Error fetching TMDB info:', error);
    }
    return {};
  };

  const fetchKeywords = async (tmdb_id) => {
    if (!tmdb_id) return [];
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${tmdb_id}/keywords?api_key=${TMDB_API_KEY}`
      );

      if (!response.ok) {
        throw new Error('TMDB sunucusu yanıt vermedi');
      }

      const data = await response.json();
      return data.keywords.map((keyword) => keyword.name);
    } catch (error) {
      console.error('Error fetching keywords:', error);
    }
    return [];
  };

  const handleOpenModal = (movie) => {
    setSelectedMovie(movie);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  return (
    
    <div className="app-container">
      <div className="content-wrapper">
        <h1 className="title">Film Öneri Keşfi</h1>

        <div className="input-section">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Nasıl bir film izlemek istiyorsunuz?"
            className="input-field"
          />
          <button 
            onClick={getRecommendations} 
            disabled={loading}
            className={`submit-button ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <span className="loading-spinner">
                <svg className="animate-spin spinner-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Yükleniyor...
              </span>
            ) : (
              'Öneriler Al'
            )}
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="grid-container">
          {recommendations.map((movie, index) => (
            <div key={index} className="movie-card">
              <div className="image-wrapper">
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.baslik}
                    className="movie-poster"
                  />
                ) : (
                  <div className="no-poster">Poster Yok</div>
                )}
              </div>
              <div className="movie-info">
                <h3 className="movie-title">{movie.baslik}</h3>
                <div className="rating-section">
                  <div className="rating">
                    <svg className="rating-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 .587l3.668 7.568 8.328 1.207c.909.132 1.271 1.209.588 1.81l-6.039 5.785 1.416 8.268c.159.925-.818 1.63-1.636 1.168l-7.435-3.903-7.435 3.903c-.818.462-1.795-.243-1.636-1.168l1.416-8.268-6.039-5.785c-.683-.601-.321-1.678.588-1.81l8.328-1.207L12 .587z" />
                    </svg>
                    <span className="rating-value">{movie.deger} / 10</span>
                  </div>
                  <button onClick={() => handleOpenModal(movie)} className="detail-button">
                    Detay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedMovie && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-title">{selectedMovie.baslik}</h2>
              <p className="modal-description">{selectedMovie.ozet}</p>
              <button onClick={handleCloseModal} className="close-button">Kapat</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



export default withAuthenticationRequired(FilmOnerileri, {
  onRedirecting: () => <Loading />,
});
