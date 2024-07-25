import React from 'react';

const PageLinks = ({ activeLink, onLinkClick, isAdmin }) => (
  <div className="page-links">
    <a href="#" className={`item-link ${activeLink === 'Home' ? 'active' : ''}`} onClick={() => onLinkClick('Home')}>홈</a>
    <a href="#" className={`item-link ${activeLink === 'Profile' ? 'active' : ''}`} onClick={() => onLinkClick('Profile')}>프로필</a>
    {/* <a href="#" className={`item-link ${activeLink === 'Search' ? 'active' : ''}`} onClick={() => onLinkClick('Search')}>검색</a> */}
    <a href="#" className={`item-link ${activeLink === 'Message' ? 'active' : ''}`} onClick={() => onLinkClick('Message')}>메시지</a>
    <a href="#" className={`item-link ${activeLink === 'Follow' ? 'active' : ''}`} onClick={() => onLinkClick('Follow')}>친한친구</a>
    <a href="#" className={`item-link ${activeLink === 'Community' ? 'active' : ''}`} onClick={() => onLinkClick('Community')}>커뮤니티</a>
    <a href="#" className={`item-link ${activeLink === 'Diary' ? 'active' : ''}`} onClick={() => onLinkClick('Diary')}>다이어리</a>
    {isAdmin && (
      <a href="#" className={`item-link ${activeLink === 'Writing' ? 'active' : ''}`} onClick={() => onLinkClick('Writing')}>글쓰기</a>
    )}
  </div>
);

export default PageLinks;
