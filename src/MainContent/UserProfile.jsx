import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const UserProfile = () => {
  const { userId } = useParams();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`https://192.168.6.45:3001/user/${userId}`, { withCredentials: true });
        setUserProfile(response.data);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (!userProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="user-profile">
      <h1>{userProfile.username}</h1>
      <img src={`https://192.168.6.45:3001${userProfile.profilePicture}`} alt="Profile" />
      <p>Email: {userProfile.email}</p>
      <p>Followers: {userProfile.followers.split(',').length}</p>
      <p>Following: {userProfile.following.split(',').length}</p>
    </div>
  );
};

export default UserProfile;
