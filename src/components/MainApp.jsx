import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Sidebar from './Sidebar';
import Main from './Main';
import Footer from './Footer';
import FavouritesContent from '../MainContent/SearchContent';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Profile from '../MainContent/Profile';
import UserProfile from '../MainContent/UserProfile';

function MainApp({ userName, onLogout }) {
  const [activeLink, setActiveLink] = useState('Home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);

  const handleLinkClick = useCallback((link) => {
    console.log(`Navigating to ${link}`);
    setActiveLink(link);
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    setActiveLink('Favourites');
    alert(`Search initiated for: ${query}`);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('https://192.168.6.45:3001/authcheck', { withCredentials: true });
        if (response.data.isLogin === 'True') {
          console.log('User is logged in.');
        } else {
          console.log('User is not logged in.');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="app-wrapper">
      <Sidebar
        menuOpen={menuOpen}
        toggleMenu={toggleMenu}
        activeLink={activeLink}
        onLinkClick={handleLinkClick}
        userName={userName}
        onLogout={onLogout}
      />
      <div className="right-area">
        <Header toggleMenu={toggleMenu} onSearch={handleSearch} onLinkClick={handleLinkClick} />
        {activeLink === 'Favourites' ? (
          <FavouritesContent searchQuery={searchQuery} />
        ) : (
          <Main activeLink={activeLink} userName={userName} />
        )}
        <Footer />
      </div>
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/user/:userId" element={<UserProfile />} />
      </Routes>
    </div>
  );
}

export default MainApp;
