import React from 'react';

const Profile = ({ userName, onLogout }) => (
  <div className="profile">
    <div className="profile-info">
      <img src="https://via.placeholder.com/40" alt="Profile" />
      <div className="profile-name">{userName}</div> {/* userName 표시 */}
      <button onClick={onLogout}>로그아웃</button>
    </div>
  </div>
);

export default Profile;
