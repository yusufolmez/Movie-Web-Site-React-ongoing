import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Comments from './Comments';

const MovieDetail = () => {
  const { title } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loginWithRedirect, user } = useAuth0();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      const formattedTitle = title.replace(/-/g, ' ');
      try {
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=1ac1c652640394393d245daab04c06b2&query=${encodeURIComponent(formattedTitle)}`);
        if (!response.ok) {
          throw new Error("Ağ isteği başarısız oldu");
        }
        const data = await response.json();
        setMovie(data.results[0]);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [title]);

  if (loading) return <div>Yükleniyor...</div>;
  if (!movie) return <div>Film bilgisi bulunamadı.</div>;

  return (
    <div className="movie-detail-container">
      <div className="movie-info">
        <h1>{movie.title}</h1>
        <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
        <p>{movie.overview}</p>
        <p>Yayın Tarihi: {movie.release_date}</p>
      </div>

      <div className="movie-comments">
        {isAuthenticated ? (
          <Comments movieId={movie.id} userSub={user.sub} username={user.name} />
        ) : (
          <div>
            <p>Yorumları görmek ve yorum yapmak için giriş yapın.</p>
            <button onClick={() => loginWithRedirect()}>Giriş Yap</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;

