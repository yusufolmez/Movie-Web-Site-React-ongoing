import React, { useEffect, useState } from 'react'; 
import { useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Comments from './Comments';

const MovieDetail = () => {
  const { title } = useParams();
  const [movie, setMovie] = useState(null);
  const [actors, setActors] = useState([]);  // Aktörleri tutacak state
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, loginWithRedirect, user } = useAuth0();

  useEffect(() => {
    const fetchMovieDetails = async () => {
      const formattedTitle = title.replace(/-/g, ' '); // URL'deki - karakterlerini boşlukla değiştiriyoruz
      try {
        const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=1ac1c652640394393d245daab04c06b2&query=${encodeURIComponent(formattedTitle)}`);
        if (!response.ok) {
          throw new Error("Ağ isteği başarısız oldu");
        }
        const data = await response.json();
        const movieId = data.results[0].id;
        
        const movieDetailResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=1ac1c652640394393d245daab04c06b2`);
        const movieDetailData = await movieDetailResponse.json();
        
        // Aktörleri al
        const actorsResponse = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=1ac1c652640394393d245daab04c06b2`);
        const actorsData = await actorsResponse.json();

        setMovie(movieDetailData); // Film verisini state'e set et
        setActors(actorsData.cast.slice(0, 5)); // İlk 5 aktörü al
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
      <div className="movie-detail">
        <div className="poster">
          <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} />
        </div>
        <div className="backdrop">
          <img src={`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`} alt={movie.title} />
        </div>
        <div className="Genres">
          {movie.genres && movie.genres.length > 0 ? (
            movie.genres.map((genre) => (
              <button key={genre.id}>{genre.name}</button>
            ))
          ) : (
            <p>Tür bilgisi bulunamadı.</p>
          )}
        </div>
        <div className="actors">
          {actors.length > 0 ? (
            actors.map((actor) => (
              <div key={actor.id} className="actor">
                <img 
                  src={`https://image.tmdb.org/t/p/w500${actor.profile_path}`} 
                  alt={actor.name}  
                />
                <p>{actor.name}</p>
              </div>
            ))
          ) : (
            <p>Aktör bilgisi bulunamadı.</p>
          )}
        </div>
        <div className="info">
          <div>
            <h2>{movie.title}</h2>
            <p>{movie.overview}</p>
            
            <div className="vote-average-container">
              <div 
                className="vote-average-bar"
                style={{ width: `${(movie.vote_average * 10).toFixed(1)}%` }}
              >
                <span className="vote-average-text">
                  {(movie.vote_average).toFixed(1)} / 10
                </span>
              </div>
            </div>

            <p className="vote-count">Oy Sayısı: {movie.vote_count}</p>
          </div>

        </div>

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
