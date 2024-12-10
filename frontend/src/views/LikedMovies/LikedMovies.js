import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";
import Loading from "../../components/Loading";

const LikedMovies = () => {
  const { userSub } = useParams();
  const location = useLocation();
  const { getAccessTokenSilently, user } = useAuth0();
  const [likedMovies, setLikedMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (isMounted) {
        const currentUserSub = getUserSub();
        console.log("Current user sub:", currentUserSub);
        if (currentUserSub) {
          await fetchLikedMovies(currentUserSub);
        } else {
          console.error("User sub not found");
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [location, getAccessTokenSilently, user]);

  const getUserSub = () => {
    // URL'yi alıyoruz
    const pathname = window.location.pathname;
    
    // URL'den userSub'u almak için RegEx kullanıyoruz
    const match = pathname.match(/^\/userslike\/(auth0%7C[\w-]+)-likedmovies$/);
    
    // Eğer eşleşme varsa, userSub'yu döndürüyoruz
    return match ? decodeURIComponent(match[1]) : null;
  };

  const fetchLikedMovies = async (currentUserSub) => {
    console.log("Fetching liked movies for user:", currentUserSub);
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const response = await fetch(`http://localhost:5000/api/movies/liked/${currentUserSub}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Beğenilen filmler alınamadı");
      }

      const data = await response.json();
      console.log("Raw API response:", data);
      console.log("Liked movies data:", data); 
      const likedMoviesIds = data.filter(movie => movie.is_liked === 1).map(movie => movie.movie_id);
      console.log("Filtered liked movie IDs:", likedMoviesIds);
      await fetchMovieDetails(likedMoviesIds);
    } catch (error) {
      console.error("Error fetching liked movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMovieDetails = async (movieIds) => {
    console.log("Fetching movie details for IDs:", movieIds);
    const apiKey = '1ac1c652640394393d245daab04c06b2'; 
    try {
      const moviePromises = movieIds.map(id =>
        fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=tr-TR`)
          .then(res => res.json())
      );

      const movieData = await Promise.all(moviePromises);
      console.log("Movie details:", movieData); 
      setLikedMovies(movieData);
    } catch (error) {
      console.error("Error fetching movie details:", error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="liked-movies-container">
      <h1>Beğenilen Filmler</h1>
      {likedMovies.length === 0 ? (
        <p>Henüz beğenilen film bulunmamaktadır.</p>
      ) : (
        <div className="movie-posters">
          {likedMovies.map(movie => (
            <div key={movie.id}>
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
              />
              <h2>{movie.title}</h2>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedMovies;

