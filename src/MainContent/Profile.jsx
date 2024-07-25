import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Profile.css'; // CSS 파일 import

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('https://192.168.6.45:3001/user-profile', { withCredentials: true });
        setUserProfile(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleProfilePictureChange = (event) => {
    setProfilePicture(event.target.files[0]);
  };

  const handleProfilePictureUpload = async () => {
    if (profilePicture) {
      const formData = new FormData();
      formData.append('profilePicture', profilePicture);

      try {
        const response = await axios.post('https://192.168.6.45:3001/upload-profile-picture', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });
        setUserProfile({ ...userProfile, profilePicture: response.data.profilePicturePath });
        alert('프로필 사진이 성공적으로 업데이트되었습니다.');
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        alert('프로필 사진 업로드 중 오류가 발생했습니다.');
      }
    }
  };

  const fetchFollowers = async () => {
    try {
      const response = await axios.get('https://192.168.6.45:3001/followers', { withCredentials: true });
      setFollowers(response.data);
      setShowFollowersModal(true);
    } catch (error) {
      console.error('Error fetching followers list:', error);
    }
  };

  const fetchFollowing = async () => {
    try {
      const response = await axios.get('https://192.168.6.45:3001/following', { withCredentials: true });
      setFollowing(response.data);
      setShowFollowingModal(true);
    } catch (error) {
      console.error('Error fetching following list:', error);
    }
  };

  const handleCloseModal = () => {
    setShowFollowersModal(false);
    setShowFollowingModal(false);
  };

  const handleUserClick = (userId) => {
    handleCloseModal();
    navigate(`/user/${userId}`);
  };

  if (!userProfile) {
    return <div className="loading">Loading...</div>;
  }

  // 프로필 사진 URL 설정
  // 기존 코드...
  const profilePictureSrc = userProfile.profilePicture ? `https://192.168.6.45:3001${userProfile.profilePicture}` : '/Profile.jpg';

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div className="profile-picture">
          <img src={profilePictureSrc} alt="Profile" />
        </div>
        <div className="profile-info">
          <h1>{userProfile.username}</h1>
          <div className="profile-stats">
            <div className="profile-stat" onClick={fetchFollowers}>
              <div className="profile-stat-text">팔로워</div>
              <div className="profile-stat-count">{userProfile.followersCount || 0}</div>
            </div>
            <div className="profile-stat" onClick={fetchFollowing}>
              <div className="profile-stat-text">팔로잉</div>
              <div className="profile-stat-count">{userProfile.followingCount || 0}</div>
            </div>
          </div>
          <div className="profile-actions">
            <input type="file" accept="image/*" onChange={handleProfilePictureChange} />
            <button onClick={handleProfilePictureUpload}>프로필 사진 업로드</button>
          </div>
        </div>
      </header>
      {showFollowersModal && (
        <div className="modal">
          <h3>팔로워</h3>
          <ul>
            {followers.map((follower) => (
              <li key={follower.id} onClick={() => handleUserClick(follower.id)}>
                {follower.username}
              </li>
            ))}
          </ul>
          <button onClick={handleCloseModal}>닫기</button>
        </div>
      )}
      {showFollowingModal && (
        <div className="modal">
          <h3>팔로잉</h3>
          <ul>
            {following.map((follow) => (
              <li key={follow.id} onClick={() => handleUserClick(follow.id)}>
                {follow.username}
              </li>
            ))}
          </ul>
          <button onClick={handleCloseModal}>닫기</button>
        </div>
      )}
    </div>
  );
};

export default Profile;
