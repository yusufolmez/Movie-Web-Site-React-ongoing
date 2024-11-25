import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const TestComponent = () => {
  const [searchQuery, setSearchQuery] = useState(""); // Arama terimi
  const [movies, setMovies] = useState([]); // Arama sonuçları
  const location = useLocation();
  const navigate = useNavigate();

  // Arama işlemi için API çağrısı
  const searchMovies = async (query) => {
    if (!query) {
      setMovies([]); // Eğer arama boşsa, sonuçları sıfırla
      return;
    }

    try {
      const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
        params: {
          api_key: "1ac1c652640394393d245daab04c06b2", // TMDB API anahtarınızı buraya ekleyin
          query: query,
          language: "en-US",
          page: 1,
          include_adult: false,
        },
      });
      setMovies(response.data.results); // Film verisini state'e aktar
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  const handleSearchInputChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    // URL'yi arama sorgusuna göre güncelle
    navigate(`/?query=${value}`, { replace: true });
  };

  // URL'den searchQuery'yi almak için
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("query");
    if (query) {
      setSearchQuery(query);
      searchMovies(query);
    }
  }, [location.search]);

  return (
    <div>
      {/* Arama Çubuğu */}
      <input
        type="text"
        placeholder="Ara..."
        value={searchQuery}
        onChange={handleSearchInputChange}
      />

      {/* Arama Sonuçları */}
      {movies.length > 0 && (
        <div className="search-results">
          <ul>
            {movies.map((movie) => (
              <li key={movie.id}>
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="movie-poster"
                />
                <span>{movie.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Arama Sonucu Yoksa */}
      {movies.length === 0 && searchQuery && (
        <div className="no-results">No results found</div>
      )}
    </div>
  );
};

export default TestComponent;
