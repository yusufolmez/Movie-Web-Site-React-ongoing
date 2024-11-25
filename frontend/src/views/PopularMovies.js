import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';

const TMDB_API_KEY = '1ac1c652640394393d245daab04c06b2';
const TMDB_API_URL = 'https://api.themoviedb.org/3';

const PopularMovies = () => {
  const { isAuthenticated, user } = useAuth0();
  const [movies, setMovies] = useState([]);
  const [likedMovies, setLikedMovies] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(
          `${TMDB_API_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=tr-TR&page=1`
        );
        if (!response.ok) {
          throw new Error('Film verileri alınamadı');
        }
        const data = await response.json();
        setMovies(data.results);
      } catch (error) {
        setError('Film verileri yüklenirken bir hata oluştu');
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleLike = (movieId) => {
    const updatedLikedMovies = new Set(likedMovies);
    if (updatedLikedMovies.has(movieId)) {
      updatedLikedMovies.delete(movieId);
      console.log(`Movie with ID ${movieId} unliked by user with ID ${user.sub}`);
    } else {
      updatedLikedMovies.add(movieId);
      console.log(`Movie with ID ${movieId} liked by user with ID ${user.sub}`);
    }
    setLikedMovies(updatedLikedMovies);

    if (!user) {
      console.log(`Movie with ID ${movieId} liked/unliked, but user is not authenticated.`);
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.loadingContainer}>
        <p style={styles.errorMessage}>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentContainer}>
        <h1 style={styles.title}>Popüler Filmler</h1>

        <div style={styles.gridContainer}>
          {movies.map((movie) => (
            <div key={movie.id} style={styles.movieCard}>
              <div style={styles.imageContainer}>
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    style={styles.movieImage}
                  />
                ) : (
                  <div style={styles.noImageContainer}>
                    <span style={styles.noImageText}>Görsel Yok</span>
                  </div>
                )}
              </div>
              <div style={styles.movieInfo}>
                {/* Film Başlığı için ayrı bir div */}
                <div style={styles.titleContainer}>
                  <h2 style={styles.movieTitle}>{movie.title}</h2>
                </div>
                {/* Puan ve beğeni butonu için ayrı bir div */}
                <div style={styles.ratingContainer}>
                  <span>{movie.vote_average.toFixed(1)}</span>
                  {isAuthenticated && (
                    <button
                      style={styles.likeButton}
                      aria-label={`Like ${movie.title}`}
                      onClick={() => handleLike(movie.id)}
                    >
                      <span style={styles.heartWrapper}>
                        <FontAwesomeIcon icon={likedMovies.has(movie.id) ? solidHeart : regularHeart} style={styles.heartIcon} />
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    padding: '20px',
    backgroundColor: '#f0f0f0',
  },
  contentContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '20px',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
  },
  movieCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  imageContainer: {
    height: '300px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  movieImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
  },
  noImageText: {
    color: '#666',
  },
  movieInfo: {
    padding: '10px',
  },
  titleContainer: {
    marginBottom: '0.5rem',
  },
  movieTitle: {
    fontSize: '1.25rem',
    margin: 0,
    maxHeight: '3rem',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  ratingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  likeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none', // Outline kaldırıldı
    cursor: 'pointer',
  },
  heartWrapper: {
    padding: '5px',
  },
  heartIcon: {
    color: 'red',
    width: '24px',
    height: '24px',
  },
};

export default PopularMovies;
