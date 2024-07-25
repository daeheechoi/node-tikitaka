import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './FollowContent.css'; // CSS 파일 import

const FollowContent = () => {
    const [profiles, setProfiles] = useState([]);
    const [following, setFollowing] = useState([]);
    const userId = Cookies.get('userId');

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const profilesResponse = await axios.get('https://192.168.6.45:3001/profiles', { withCredentials: true });
                setProfiles(profilesResponse.data);
            } catch (error) {
                console.error('Error fetching profiles:', error);
            }
        };

        const fetchFollowing = async () => {
            try {
                const followingResponse = await axios.get('https://192.168.6.45:3001/following', { withCredentials: true });
                setFollowing(followingResponse.data);
            } catch (error) {
                console.error('Error fetching following list:', error);
            }
        };

        fetchProfiles();
        fetchFollowing();
    }, []);

    const handleFollow = async (profileId) => {
        try {
            const response = await axios.post('https://192.168.6.45:3001/follow', { profileId }, { withCredentials: true });
            if (response.data.success) {
                const followedProfile = profiles.find(profile => profile.id === profileId);
                setProfiles(profiles.filter(profile => profile.id !== profileId));
                setFollowing([...following, followedProfile]);
                alert('팔로우가 완료되었습니다.');
            }
        } catch (error) {
            if (error.response && error.response.status === 400 && error.response.data.error === 'Already following') {
                alert('이미 팔로우한 사용자입니다.');
            } else {
                console.error('Error following profile:', error);
            }
        }
    };

    const handleFavorite = async (profileId, isFavorite) => {
        try {
            const response = await axios.post('https://192.168.6.45:3001/favoritefriend', { profileId, isFavorite }, { withCredentials: true });
            if (response.data.success) {
                setFollowing(following.map(profile => 
                    profile.id === profileId ? { ...profile, isFavorite } : profile
                ));
            }
        } catch (error) {
            console.error('Error updating favorite status:', error);
        }
    };

    const handleUnfollow = async (profileId) => {
        try {
            const response = await axios.post('https://192.168.6.45:3001/unfollow', { profileId }, { withCredentials: true });
            if (response.data.success) {
                setFollowing(following.filter(profile => profile.id !== profileId));
                alert('언팔로우가 완료되었습니다.');
            }
        } catch (error) {
            console.error('Error unfollowing profile:', error);
        }
    };

    const getRecommendedProfiles = () => {
        const followingIds = following.map(friend => friend.id);
        return profiles.filter(profile => !followingIds.includes(profile.id));
    };

    const sortedFollowing = [...following].sort((a, b) => b.isFavorite - a.isFavorite);

    return (
        <div className="main">
            <h1 className="section-title">팔로잉</h1>
            <div className="follow-container">
                {sortedFollowing.map(friend => (
                    <div key={friend.id} className="follow-box">
                        <h3>
                            <span
                                onClick={() => handleFavorite(friend.id, !friend.isFavorite)}
                                className="favorite-button"
                            >
                                {friend.isFavorite ? '⭐' : '☆'}
                            </span>
                            {friend.username}
                        </h3>
                        <p>Email: {friend.email}</p>
                        <button
                            onClick={() => handleUnfollow(friend.id)}
                            className="unfollow-button"
                        >
                            ❌ Unfollow
                        </button>
                    </div>
                ))}
            </div>
            <div className="divider"></div>
            <div className="recommendations-container">
                <h1 className="section-title-1">추천친구</h1>
                <p className="recommendations-text">더 많은 친구를 찾아보세요!</p>
                <div className="recommendfriend-container">
                    {getRecommendedProfiles().map(profile => (
                        <div key={profile.id} className="recommendfriend-box">
                            <h2>{profile.username}</h2>
                            <p>Email: {profile.email}</p>
                            <p>Following: {Array.isArray(profile.following) ? profile.following.length : 0}</p>
                            <p>Followers: {Array.isArray(profile.followers) ? profile.followers.length : 0}</p>
                            <button
                                onClick={() => handleFollow(profile.id)}
                                className="follow-button"
                            >
                                ❤️ Follow
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FollowContent;
