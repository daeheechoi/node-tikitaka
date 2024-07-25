import React from 'react';

// 제일 하단에 들어가는 푸터 입니다. 

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>Created by: goodplace, Look at him, bigSunshine</p>
        <p>&copy; 2024 Team Tiki Taka. All rights reserved.</p>
        <p>
          <a href="/terms-of-service">Terms of Service</a> | <a href="/privacy-policy">Privacy Policy</a> | <a href="/contact-us">Contact Us</a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
