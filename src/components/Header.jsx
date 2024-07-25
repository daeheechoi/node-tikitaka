import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Header = ({ toggleMenu, onSearch, onLinkClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [lastNotificationId, setLastNotificationId] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('https://192.168.6.45:3001/notifications', { withCredentials: true });
        setNotifications(response.data);
        setNotificationCount(response.data.length);

        // 새로운 알림이 있는지 확인
        if (response.data.length > 0 && (!lastNotificationId || lastNotificationId !== response.data[0].id)) {
          showBrowserNotification(response.data[0]);
          setLastNotificationId(response.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 3000);
    return () => clearInterval(interval);
  }, [lastNotificationId]);

  const showBrowserNotification = (notification) => {
    if (Notification.permission === 'granted') {
      let message;
      if (notification.type === 'message') {
        message = `${notification.userName}님이 새 메시지를 보냈습니다.`;
      } else if (notification.type === 'like') {
        message = `${notification.userName}님이 ${notification.timeAgo} 전에 좋아요를 눌렀습니다.`;
      } else {
        message = notification.message;
      }

      const browserNotification = new Notification('새 알림', {
        body: message,
        icon: 'path/to/icon.png', // 아이콘 경로를 적절히 수정하세요
      });

      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
      };

      setTimeout(() => {
        browserNotification.close();
      }, 2000); // 2초 후에 알림 자동 닫기
    }
  };

  const handleNotificationClick = async () => {
    try {
      await axios.post('https://192.168.6.45:3001/mark-notifications-read', {}, { withCredentials: true });
      setNotificationCount(0);
      const notificationWindow = window.open('', 'Notifications', 'width=400,height=600');
      if (notificationWindow) {
        notificationWindow.document.write('<html><head><title>Notifications</title></head><body>');
        notifications.forEach(notification => {
          let notificationMessage;
          if (notification.type === 'message') {
            notificationMessage = `${notification.userName}님이 새 메시지를 보냈습니다.`;
          } else if (notification.type === 'like') {
            notificationMessage = `${notification.userName}님이 ${notification.timeAgo} 전에 좋아요를 눌렀습니다.`;
          } else {
            notificationMessage = notification.message;
          }
          notificationWindow.document.write(`<p>${notificationMessage}</p>`);
        });
        notificationWindow.document.write('</body></html>');
        setTimeout(() => notificationWindow.close(), 10000); // 10초 후에 알림 창 닫기
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const toggleMoreMenu = () => setMoreMenuOpen(!moreMenuOpen);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  const searchContainerStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const searchInputStyle = {
    flex: 1,
    padding: '8px 250px 8px 12px', // 오른쪽에 공간 추가
    fontSize: '14px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    // 기본 돋보기 아이콘 제거
    backgroundImage: 'none',
  };

  const searchIconStyle = {
    position: 'absolute',
    right: '10px', // 아이콘을 오른쪽 끝으로 위치
    cursor: 'pointer',
  };

  return (
    <div className="right-area-upper">
      <button className="menu-button" onClick={toggleMenu}>
        <svg width="24" height="24" fill="none" stroke="#3f3f3f" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>
      <div className="search-part-wrapper">
        <div style={searchContainerStyle}>
          <input 
            style={searchInputStyle}
            className="search-input" 
            type="text" 
            placeholder="검색어를 입력하세요" 
            value={searchTerm} 
            onChange={handleSearchChange} 
            onKeyDown={handleKeyDown}
          />
          <svg 
            style={searchIconStyle}
            className="search-icon" 
            onClick={handleSearchSubmit} 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#3f3f3f" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <button className="btn-notification" onClick={handleNotificationClick}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6699ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-bell">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          {notificationCount > 0 && <span>{notificationCount}</span>}
        </button>
        <a className="menu-links" onClick={() => onLinkClick('CustomerSupport')}>고객센터</a>
        <a className="menu-links" onClick={() => onLinkClick('Notices')}>공지사항</a>
        <button className="more-button" onClick={toggleMoreMenu}>
          <svg width="24" height="24" fill="none" stroke="#3f3f3f" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
        <ul className={`more-menu-list ${moreMenuOpen ? '' : 'hide'}`}>
          <li><a onClick={() => onLinkClick('Games')}>게임</a></li>
          <li><a onClick={() => onLinkClick('Roulette')}>돌림판</a></li>
          <li><button className="action-buttons btn-record" onClick={() => onLinkClick('VideoUpload')}>영상 업로드</button></li>
          <li><button className="action-buttons btn-upload" onClick={() => onLinkClick('FileUpload')}>파일 업로드</button></li>
        </ul>
      </div>
    </div>
  );
};

export default Header;
