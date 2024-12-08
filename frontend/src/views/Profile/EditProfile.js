import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import './Profile.css';

const API_URL = 'http://localhost:5000';

const EditProfile = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [picture, setPicture] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setNickname(user.nickname || '');
      setPicture(user.picture || '');
    }
  }, [user]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl('');
    }
  };

  const uploadFile = async () => {
    if (!file || !user?.sub) return null;

    const formData = new FormData();
    formData.append('profilePicture', file);
    formData.append('userSub', user.sub);

    try {
      console.log('Attempting to upload file to:', `${API_URL}/api/upload-profile-picture`);
      const response = await fetch(`${API_URL}/api/upload-profile-picture`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Sunucu yanıtı:', errorText);
        throw new Error(errorText || 'Dosya yükleme hatası');
      }

      const data = await response.json();
      console.log('File upload successful:', data);
      return data.fileUrl;
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = await getAccessTokenSilently();
      let updatedPicture = picture;

      if (file) {
        const uploadedFileUrl = await uploadFile();
        if (uploadedFileUrl) {
          updatedPicture = uploadedFileUrl;
        }
      }

      console.log('Attempting to update user profile:', `${API_URL}/api/update-user/${user.sub}`);
      const response = await fetch(`${API_URL}/api/update-user/${user.sub}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, nickname, picture: updatedPicture }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(errorText || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      console.log('Profile updated successfully:', updatedUser);
      alert('Profile updated successfully!');
      
      if (typeof user.update === 'function') {
        user.update({
          name: updatedUser.name,
          nickname: updatedUser.nickname,
          picture: updatedUser.picture
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(`Failed to update profile: ${error.message}`);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="edit-profile">
      <h2>Edit Profile</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="nickname">Nickname</label>
          <input
            id="nickname"
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="picture">Profile Picture</label>
          <input
            id="picture"
            type="file"
            onChange={handleFileChange}
            accept="image/*"
          />
        </div>
        {(previewUrl || picture) && (
          <div className="form-group">
            <img 
              src={previewUrl || picture} 
              alt="Profile preview" 
              style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
            />
          </div>
        )}
        <button type="submit">Update Profile</button>
      </form>
    </div>
  );
};

export default EditProfile;

