import React from 'react';
import Profile from './Profile';
import PageLinks from './PageLinks';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ menuOpen, toggleMenu, activeLink, onLinkClick, userName, onLogout }) => {
  const navigate = useNavigate();

  const handleWriteClick = () => {
    onLinkClick('Writing');
  };

  return (
    <div className={`left-area ${menuOpen ? 'open' : 'closed'}`}>
      <div className="app-header">
        <button className="close-menu" onClick={toggleMenu}>
          <svg width="24" height="24" fill="none" stroke="#51a380" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="left-area-content">
        <Profile userName={userName} onLogout={onLogout} />
        <PageLinks activeLink={activeLink} onLinkClick={onLinkClick} />
        <button className="btn-invite" onClick={handleWriteClick}>글쓰기</button>
      </div>
    </div>
  );
};

export default Sidebar;
