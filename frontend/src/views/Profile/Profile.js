import React, { useState, useEffect, useCallback } from "react";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import Loading from "../../components/Loading";

import './Profile.css';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, isAuthenticated, loginWithRedirect, logout, getAccessTokenSilently } = useAuth0();
  const userSub = user?.sub;
  const [likedMovies, setLikedMovies] = useState([]);
  const [otherUsers, setOtherUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [topGenres, setTopGenres] = useState([]);
  const [totalLikedMovies, setTotalLikedMovies] = useState(0); // Yeni state eklendi
  const banner= require('../../assets/profile-banner.png');
  useEffect(() => {
    if (user) {

      // Diğer kullanıcıları, arkadaşları ve arkadaşlık isteklerini getir
      fetchOtherUsers();
      fetchFriends();
      fetchFriendRequests();
    }
    if (isAuthenticated && userSub) {
      // Kullanıcı giriş yapmışsa, beğenilen filmleri veritabanından alalım
      fetchLikedMovies(userSub);
    }
  }, [user, isAuthenticated, userSub]);


  const fetchLikedMovies = async (userSub) => {
    try {
      const response = await fetch(`http://localhost:5000/api/movies/liked/${userSub}`);
      if (!response.ok) {
        throw new Error("Beğenilen filmler alınamadı");
      }

      const data = await response.json();
      const likedMoviesIds = data.filter(movie => movie.is_liked === 1).map(movie => movie.movie_id);
      setTotalLikedMovies(likedMoviesIds.length); // Güncellenen fetchLikedMovies fonksiyonu
      fetchMovieDetails(likedMoviesIds.slice(0, 5));
    } catch (error) {
      console.error("Error fetching liked movies:", error);
    }
  };

  const fetchMovieDetails = async (movieIds) => {
    const apiKey = '1ac1c652640394393d245daab04c06b2';
    try {
      const moviePromises = movieIds.map(id =>
        fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apiKey}&language=tr-TR`)
          .then(res => res.json())
      );

      const movieData = await Promise.all(moviePromises);
      setLikedMovies(movieData);
      calculateTopGenres(movieData);
    } catch (error) {
      console.error("Error fetching movie details:", error);
    }
  };


  const fetchOtherUsers = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setOtherUsers(data.filter(otherUser => otherUser.id !== user.sub));
    } catch (error) {
      console.error('Diğer kullanıcıları getirme hatası:', error);
    }
  };


  const fetchFriends = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/friends/${user.sub}`);
      const data = await response.json();
      // Arkadaş listesini benzersiz hale getir
      const uniqueFriends = Array.from(new Set(data.map(friend => friend.id)))
        .map(id => data.find(friend => friend.id === id));
      setFriends(uniqueFriends);
    } catch (error) {
      console.error('Arkadaşları getirme hatası:', error);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/friend-requests/${user.sub}`);
      const data = await response.json();
      // Auth0'dan gelen kullanıcı bilgilerini kullanarak istekleri zenginleştirelim
      const enrichedRequests = await Promise.all(data.map(async (request) => {
        const userInfoResponse = await fetch(`http://localhost:5000/api/user-info/${request.user_sub}`);
        const userInfo = await userInfoResponse.json();
        return { ...request, name: userInfo.name, picture: userInfo.picture };
      }));
      setFriendRequests(enrichedRequests);
    } catch (error) {
      console.error('Arkadaşlık isteklerini getirme hatası:', error);

    }
  };
  
  

  const addFriend = async (friendSub) => {
    try {
      const response = await fetch('http://localhost:5000/api/add-friend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userSub: user.sub, friendSub }),
      });
      if (response.ok) {
        alert('Arkadaşlık isteği gönderildi');
        fetchOtherUsers();
      }
    } catch (error) {
      console.error('Arkadaş ekleme hatası:', error);
    }
  };

  const handleFriendRequest = async (requestId, userSub, friendSub, status) => {
    try {
      const response = await fetch('http://localhost:5000/api/update-friendship', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userSub, friendSub, status }),
      });
      if (response.ok) {
        fetchFriendRequests();
        fetchFriends();
      }
    } catch (error) {
      console.error('Arkadaşlık isteği güncelleme hatası:', error);
    }
  };

  const calculateTopGenres = useCallback((movies) => {
    const genreCounts = {};
    movies.forEach(movie => {
      movie.genres.forEach(genre => {
        genreCounts[genre.name] = (genreCounts[genre.name] || 0) + 1;
      });
    });

    const sortedGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);

    setTopGenres(sortedGenres);
  }, []);

  if (!user) {
    return <Loading />;
  }

  return (
    <div>
      <div className="banner">
        <img src={banner}/>
      </div>

      <div className="profile-container">
        <div className="profile-main">
          <div className="profile-left">
            <div className="user-info">
              <div className="profile-img">
                <img src={user.picture || "/default-profile.jpg"} alt="Profil" />
              </div>
              <div className="user-details">
                <h2>{user.name}</h2>
                <p>{user.nickname} hakkında kısa bir açıklama...</p>
                <a href="/edit-profile" className="recommend-button">Profili Düzenle</a>
              </div>
            </div>
            <div className="user-stats">
              <h3>Profil İstatistikleri</h3>
              <p>İzlenen Toplam Film: {totalLikedMovies}</p> {/* Güncellenen profil istatistikleri */}
              <p>Favori Tür: {topGenres.join(', ')}</p>
              <p>Ortalama Puan: {/* Calculate and display average rating if available */}</p>
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
                <Link to={`/userslike/${user.sub}-likedmovies`} className="link ra">More...</Link>
              </div>
            </div>
          </div>
          <div className="profile-right">
            <div className="friends-and-requests">
              <h3>Arkadaşlar ve İstekler</h3>
              <div className="friend-requests">
                <h4>Arkadaşlık İstekleri</h4>
                {friendRequests.map((request) => (
                  <div key={request.id} className="friend-request">
                    <img src={request.picture || "/default-profile.jpg"} alt={request.name} />
                    <p>{request.name}</p>
                    <button onClick={() => handleFriendRequest(request.id, request.user_sub, request.friend_sub, 'accepted')}>Onayla</button>
                    <button onClick={() => handleFriendRequest(request.id, request.user_sub, request.friend_sub, 'rejected')}>Sil</button>
                  </div>
                ))}
              </div>
              <div className="friends-list">
                <h4>Arkadaşlar</h4>
                {friends.map((friend) => (
                  <div key={friend.id} className="friend-profile">
                    <img src={friend.picture || "/default-profile.jpg"} alt={friend.name} />
                    <p>{friend.nickname}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="other-users">
              <div className="other-user-profile">
              
              {otherUsers.map((otherUser) => (
                <React.Fragment key={otherUser.id}>
                  <img
                    src={otherUser.picture || "/default-profile.jpg"}
                    alt={otherUser.name}
                  />
                  <p>{otherUser.name}</p>
                  <button
                    onClick={() => addFriend(otherUser.id)}
                    className="add-friend-btn"
                  >
                    Arkadaş Ekle
                  </button>
                </React.Fragment>
              ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuthenticationRequired(Profile, {
  onRedirecting: () => <Loading />,
});

