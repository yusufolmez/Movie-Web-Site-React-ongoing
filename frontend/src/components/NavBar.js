import React, { useState, useEffect } from "react";
import { NavLink as RouterNavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import './Navbar.css';
import {
  Collapse,
  Container,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  InputGroup,
  Input,
  InputGroupText,
} from "reactstrap";
import { useAuth0 } from "@auth0/auth0-react";
import { useTheme } from "../context/ThemeContext";
import axios from 'axios';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // Arama terimi
  const [movies, setMovies] = useState([]); // Arama sonuçları
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate(); 
  
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
    document.querySelector('.search-results').classList.remove('empty');
  };
    
  const hideSearchResults = () => {
    const body = document.querySelector('body');
    body.classList.remove('no-scroll'); // Kaydırmayı yeniden etkinleştir
    document.querySelector('.search-results').classList.add('empty');
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
  
    if (!value) {
      hideSearchResults(); // Arama sorgusu boşsa sonuçları gizle
    } else {
      searchMovies(value); // Arama sorgusu doluysa API çağrısı yap
    }
  };

  const handlePosterClick = (title) => {
    navigate(`/movie/${title}`);  // Yönlendirmeyi /movie/:id rotasına yapıyoruz
    console.log("Clicked Movie ID for URL:", title);
    window.location.reload();
  };

  return (
    <div>
      {/* Arama sonuçları */}
      {movies.length > 0 && (
        <div className={`search-results ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}>
          <ul className="movie-list">
            {movies.map((movie) => (
              <li key={movie.id} className="movie-item">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="movie-poster"
                  onClick={() => handlePosterClick(movie.title)} // Poster'a tıklandığında yönlendirme yapıyoruz
                />
                <span>{movie.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <Navbar className={`nav-container ${theme === 'dark' ? 'bg-dark' : 'bg-light'}`} light expand="md" container={false}>
        <NavbarBrand className="logo" />
        <NavbarToggler onClick={toggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav navbar>
            <NavItem>
              <NavLink
                tag={RouterNavLink}
                to="/"
                exact
                activeClassName="router-link-exact-active"
              >
                Anasayfa
              </NavLink>
            </NavItem>
            {isAuthenticated && (
              <NavItem>
                <NavLink
                  tag={RouterNavLink}
                  to="/external-api"
                  exact
                  activeClassName="router-link-exact-active"
                >
                  Dış API
                </NavLink>
              </NavItem>
            )}
            <NavItem>
              <NavLink
                tag={RouterNavLink}
                to="/FilmOnerileri"
                exact
                activeClassName="router-link-exact-active"
              >
                Film Önerisi
              </NavLink>
            </NavItem>
          </Nav>
        </Collapse>

        <Nav>
          <NavItem>
            <InputGroup>
              <InputGroupText>
                <FontAwesomeIcon icon="search" />
              </InputGroupText>
              <Input
                type="text"
                placeholder="Ara..."
                aria-label="Arama"
                value={searchQuery}
                onChange={handleSearchInputChange} // Arama çubuğundaki metni yakalayarak arama yapar
              />
            </InputGroup>
          </NavItem>

          {isAuthenticated && (
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret id="profileDropDown">
                <img
                  src={user.picture}
                  alt="Profil"
                  className="nav-user-profile rounded-circle"
                  width="50"
                />
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem header>{user.name}</DropdownItem>
                <DropdownItem
                  tag={RouterNavLink}
                  to="/profile"
                  className="dropdown-profile"
                  activeClassName="router-link-exact-active"
                >
                  <FontAwesomeIcon icon="user" className="mr-3" /> Profil
                </DropdownItem>
                <DropdownItem
                  id="qsLogoutBtn"
                  onClick={() => logoutWithRedirect()}
                >
                  <FontAwesomeIcon icon="power-off" className="mr-3" /> Çıkış Yap
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          )}
        </Nav>

        <Nav className="ml-auto" navbar>
          <NavItem>
            <Button
              className={`theme-switcher ${theme === 'dark' ? 'dark' : 'light'}`}
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </NavItem>
          {!isAuthenticated && (
            <NavItem>
              <Button
                id="qsLoginBtn"
                color="primary"
                className="btn-margin"
                onClick={() => loginWithRedirect()}
              >
                Giriş Yap
              </Button>
            </NavItem>
          )}
        </Nav>
      </Navbar>

      {/* Ana Sayfa İçeriğini Arama Sırasında Gizle */}
      {!searchQuery && (
        <div className="home-content">
          {/* Burada ana sayfa içeriğinizi ekleyebilirsiniz */}
        </div>
      )}
    </div>
  );
};

export default NavBar;
