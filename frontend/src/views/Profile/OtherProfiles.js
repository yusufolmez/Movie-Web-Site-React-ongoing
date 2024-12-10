import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import Loading from "../../components/Loading";
import './Profile.css';

const OtherProfiles = () => {
  // const { username } = useParams(); // Bu satırı kaldırın
  const { getAccessTokenSilently } = useAuth0();
  const [profileUser, setProfileUser] = useState(null);
  const [likedMovies, setLikedMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const getNicknameFromUrl = () => {
    const pathname = window.location.pathname; // Örnek: "/yusuf.olmez670sa-profile"
    const match = pathname.match(/^\/profile\/([^/]+)-profile$/); // Regex ile "nickname" kısmını çıkar
    return match ? match[1] : null; // "yusuf.olmez670sa" döner veya null
  };

  useEffect(() => {
    const nickname = getNicknameFromUrl();
    console.log("Nickname:", nickname);
    if (nickname) {
      fetchUserProfile(nickname);
    }
  }, []);

  const fetchUserProfile = async (nickname) => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      console.log(`Fetching profile for nickname: ${nickname}`);
      const response = await fetch(`http://localhost:5000/api/user/by-nickname/${nickname}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server response:', errorData);
        throw new Error(errorData.error || "Kullanıcı profili alınamadı");
      }
      const userData = await response.json();
      console.log('Received user data:', userData);
      setProfileUser(userData);
      await fetchLikedMovies(userData.user_id);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedMovies = async (userSub) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch(`http://localhost:5000/api/movies/liked/${userSub}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Beğenilen filmler alınamadı");
      }

      const data = await response.json();
      const likedMoviesIds = data.filter(movie => movie.is_liked === 1).map(movie => movie.movie_id);
      await fetchMovieDetails(likedMoviesIds.slice(0, 5));
    } catch (error) {
      console.error("Error fetching liked movies:", error);
    }
  };

  const fetchMovieDetails = async (movieIds) => {
    const apiKey = '1ac1c652640394393d245daab04c06b2'; // TMDB API anahtarınızı buraya ekleyin
    try {
      const moviePromises = movieIds.map(id =>
        fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=tr-TR`)
          .then(res => res.json())
      );

      const movieData = await Promise.all(moviePromises);
      setLikedMovies(movieData);
    } catch (error) {
      console.error("Error fetching movie details:", error);
    }
  };

  if (loading || !profileUser) {
    return <Loading />;
  }

  return (
    <div>
      <div className="banner">
        <p>{profileUser.name}'nin Profili</p>
      </div>

      <div className="profile-container">
        <div className="profile-main">
          <div className="profile-left">
            <div className="user-info">
              <div className="profile-img">
                <img src={profileUser.picture || "/default-profile.jpg"} alt="Profil" />
              </div>
              <div className="user-details">
                <h2>{profileUser.nickname}</h2>
                <p>{profileUser.name} hakkında kısa bir açıklama...</p>
              </div>
            </div>
            <div className="user-stats">
              <h3>Profil İstatistikleri</h3>
              <p>İzlenen Toplam Film:</p>
              <p>Favori Tür:</p>
              <p>Ortalama Puan:</p>
            </div>
            <div className="watchlist">
              <div className="div1">Beğenilen Filmler</div>
              <div className="div2">
                <div className="movie-postersx">
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
              </div>
              <div className="div3">
                <Link to={`/${profileUser.sub}-likedmovies`} className="link ra">More...</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtherProfiles;

