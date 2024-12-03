import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import { useAuth0 } from "@auth0/auth0-react";
import { useTheme } from "../context/ThemeContext";
import './Navbar.css';
import '../index.css';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Arama terimi
  const [movies, setMovies] = useState([]); // Arama sonuçları
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL parametrelerini kontrol et ve arama terimini ayarla
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      setSearchQuery(query);
      searchMovies(query); // Eğer query varsa, arama işlemini yap
    }
  }, [location]);

  const toggle = () => setIsOpen(!isOpen);

  const logoutWithRedirect = () =>
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      }
    });

    const showSearchResults = () => {
      const body = document.querySelector('body');
      body.classList.add('no-scroll'); // Kaydırmayı devre dışı bırak
      const searchResults = document.querySelector('.search-results');
      searchResults.classList.remove('empty');
      searchResults.style.display = 'block'; // Arama sonuçlarını görünür yap
    };
    
    const hideSearchResults = () => {
      const body = document.querySelector('body');
      body.classList.remove('no-scroll'); // Kaydırmayı yeniden etkinleştir
      const searchResults = document.querySelector('.search-results');
      searchResults.classList.add('empty');
      searchResults.style.display = 'none'; // Arama sonuçlarını gizle
      setMovies([]); // Arama sonuçlarını sıfırla
    };
    

  // Arama işlemi için API çağrısı
  const searchMovies = async (query) => {
    if (!query) {
      hideSearchResults(); // Arama boşsa sonuçları gizle
      return;
    }
  
    try {
      const response = await axios.get(`https://api.themoviedb.org/3/search/movie`, {
        params: {
          api_key: '1ac1c652640394393d245daab04c06b2', // TMDB API anahtarınızı buraya ekleyin
          query: query,
          language: 'en-US',
          page: 1,
          include_adult: false,
        },
      });
  
      if (response.data.results.length > 0) {
        setMovies(response.data.results);
        showSearchResults(); // Arama sonuçlarını göster
      } else {
        hideSearchResults(); // Eğer sonuç yoksa
      }
    } catch (error) {
      console.error('Error fetching data: ', error);
    }
  };

  const handleSearchInputChange = (event) => {
    const value = event.target.value;
    setSearchQuery(value);
    
    if (value) {
      // URL'yi güncelle ve arama yap
      navigate(`/search?q=${value}`);
    } else {
      hideSearchResults(); // Arama sorgusu boşsa sonuçları gizle
      // URL'deki arama parametresini kaldır
      navigate('/');
    }
  };

  const handlePosterClick = (title) => {
    navigate(`/movie/${title}`);  // Yönlendirmeyi /movie/:id rotasına yapıyoruz
    console.log("Clicked Movie ID for URL:", title);
    window.location.reload();
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);  // Menü açma/kapama
  };

  return (
    <div>
      {/* Arama sonuçları */}
      {movies.length > 0 && (
        <div className={`search-results`}>
          <ul className="movie-poster">
            {movies.map((movie) => (
              <li key={movie.id} className="movie-item">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="movie-poster"
                  onClick={() => handlePosterClick(movie.title)}
                />
                <span>{movie.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
  
      {/* Navbar */}
      <nav className={`nav-container`}>
        <div className="navbar-header">
          <div className="logo1"></div>
          
          <button className="navbar-toggler" onClick={toggle}>
            ☰
          </button>
        </div>
        <div className={`navbar-collapse ${isOpen ? 'open' : ''}`}>
          <ul className="nav-links">
            <li>
              <a href="/" className="nav-link">
                Anasayfa
              </a>
            </li>
            {isAuthenticated && (
              <li>
                <a href="/external-api" className="nav-link">
                  Dış API
                </a>
              </li>
            )}
            <li>
              <a href="/PicksForUser" className="nav-link">
                Our Picks For You
              </a>
            </li>
            <li>
              <a href="/FilmOnerileri" className="nav-link">
                Film Önerisi
              </a>
            </li>
          </ul>
        </div>
  
        {/* Arama Çubuğu */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Ara..."
            value={searchQuery}
            onChange={handleSearchInputChange}
          />
        </div>
  
        {/* Kullanıcı Menü */}
        {isAuthenticated && (
          <div className="user-menu">
            <img
              src={user.picture}
              alt="Profil"
              className="nav-user-profile"
              onClick={toggleMenu}  // Tıklama ile menüyü açıyoruz
            />
            <div className="dropdown-arrow" onClick={toggleMenu}>
              <i className="fa-light fa-caret-down"></i> {/* FontAwesome ok simgesi */}
            </div>
            <div className={`dropdown-menu ${isMenuOpen ? 'open' : ''}`}>
              <p>{user.name}</p>
              <a href="/profile" className="dropdown-link">Profil</a>
              <button onClick={() => logoutWithRedirect()} className="dropdown-link">
                Çıkış Yap
              </button>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default NavBar;
