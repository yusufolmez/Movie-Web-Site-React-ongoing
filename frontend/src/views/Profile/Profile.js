
import React from "react";
import Highlight from "../../components/Highlight";
import Loading from "../../components/Loading";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

import './Profile.css';

const Profile = () => {

  
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();



  return (
    <div>
      {/* Banner Bölümü */}
      <div className="banner">
        <p>Bu bir banner bölümü</p>
        
      </div>

      {/* Kullanıcı Bilgileri ve Diğer İçerikler */}
      <div className="profile-container">
        <div className="profile-main">
          <div className="profile-left">
            <div className="user-info">
              <div className="profile-img">
                <img src={user.picture} alt="Profile" />
              </div>
              <div className="user-details">
                <h2>{user.nickname}</h2>
                <p>Yusuf Ölmez hakkında kısa bir açıklama...</p>
              </div>
            </div>
            <div className="user-actions">
              <h3>Recent Actions</h3>
              <ul>
                <li>Film 1 Beğenildi</li>
                <li>Film 2 İzlendi</li>
                <li>Film 3 Paylaşıldı</li>
              </ul>
            </div>
          </div>
          <div className="other-users">
            <div className="other-user-profile">
              <img src="user1.jpg" alt="User 1" />
              <p>User 1</p>
            </div>
            <div className="other-user-profile">
              <img src="user2.jpg" alt="User 2" />
              <p>User 2</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// `withAuthenticationRequired` ile MovieRecommendations bileşenini sarıyoruz
export default withAuthenticationRequired(Profile, {
  onRedirecting: () => <Loading />, // Kullanıcıyı yönlendirirken Loading bileşeni gösterilecek
});
